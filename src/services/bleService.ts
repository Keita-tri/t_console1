import toast from 'react-hot-toast';
import { SENSOR_PROFILES } from '../constants/ble';
import { ConnectedSensor, SensorType } from '../types';
import { cadenceCalculatorManager } from '../utils/cadenceCalculator';

// iPad等のハードウェアリミット対応のための遅延関数
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

class BLEService {
  private connectedDevices: Map<string, BluetoothDevice> = new Map();
  private onDataReceived?: (sensorId: string, data: Record<string, number>) => void;

  setDataCallback(callback: (sensorId: string, data: Record<string, number>) => void) {
    this.onDataReceived = callback;
  }

  async scanForSensors(targetSensorType?: SensorType): Promise<BluetoothDevice[]> {
    try {
      let services: string[];
      let scanDescription: string;

      if (targetSensorType) {
        // 特定のセンサータイプのみをスキャン（iPad互換性向上）
        const profile = SENSOR_PROFILES[targetSensorType];
        if (!profile) {
          throw new Error(`Unsupported sensor type: ${targetSensorType}`);
        }
        services = [profile.serviceUUID];
        scanDescription = this.getSensorTypeDisplayName(targetSensorType);
      } else {
        // 全センサータイプをスキャン（従来の動作）
        services = Object.values(SENSOR_PROFILES).map(profile => profile.serviceUUID);
        scanDescription = 'all sensors';
      }
      
      console.log(`Bluetooth device scan starting for ${scanDescription}...`);
      console.log('Service UUIDs:', services);

      const device = await navigator.bluetooth.requestDevice({
        filters: services.map(service => ({ services: [service] })),
        optionalServices: services
      });

      console.log('Device found:', device.name || device.id);
      return [device];
    } catch (error) {
      console.error('センサーのスキャンに失敗しました:', error);
      // ★ 修正: ユーザーがキャンセルした場合はエラーメッセージを表示しない
      if (error instanceof Error && error.name !== 'NotFoundError' && error.name !== 'NotAllowedError') {
        const sensorTypeText = targetSensorType ? this.getSensorTypeDisplayName(targetSensorType) : 'sensors';
        toast.error(`Failed to scan for ${sensorTypeText}`);
      }
      throw error;
    }
  }

  /**
   * センサータイプの表示名を取得
   */
  private getSensorTypeDisplayName(sensorType: SensorType): string {
    const displayNames: Record<SensorType, string> = {
      'HeartRate': 'heart rate monitors',
      'CyclingPower': 'power meters',
      'CyclingSpeedCadence': 'speed & cadence sensors',
      'CoreBodyTemperature': 'temperature sensors',
      'MuscleoxygenSensor': 'muscle oxygen sensors',
      'SmartTrainer': 'smart trainers'
    };
    return displayNames[sensorType] || sensorType;
  }

  async connectSensor(device: BluetoothDevice): Promise<ConnectedSensor> {
    try {
      console.log(`[${device.id}] Connecting to device...`);
      await delay(500);

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('GATT接続に失敗しました');
      }
      console.log(`[${device.id}] GATT connected.`);

      // ★★★ 変更点①：サービス取得をループの外で一度だけ行う ★★★
      console.log(`[${device.id}] Identifying sensor type and getting primary service...`);
      const sensorType = await this.identifySensorType(server);
      const profile = SENSOR_PROFILES[sensorType];
      const service = await server.getPrimaryService(profile.serviceUUID);
      console.log(`[${device.id}] Sensor type: ${sensorType}, Service obtained.`);
      
      await delay(500); // サービス取得後の安定待ち

      // 特性値の購読設定
      for (const [key, charProfile] of Object.entries(profile.characteristics)) {
        try {
          console.log(`[${device.id}] Setting up characteristic: ${key}`);

          // ★★★ 変更点②：取得済みのサービスオブジェクトを使い回す ★★★
          const characteristic = await service.getCharacteristic(charProfile.uuid);
          await delay(200); // 特性値取得後の安定待ち

          // Moxyセンサーの場合は特別な処理
          if (sensorType === 'MuscleoxygenSensor' && key === 'trigger') {
              const triggerData = new Uint8Array([0x01]);
              await characteristic.writeValue(triggerData);
              console.log(`[${device.id}] Moxyトリガーを送信しました`);
          } else {
            // Moxyのmeasurement特性と、他の全センサーの特性の通知を開始
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
              // ★★★ 変更点③：データ受信部分の堅牢化 (必須) ★★★
              try {
                const target = event.target as BluetoothRemoteGATTCharacteristic;
                if (!target.value || target.value.byteLength === 0) {
                  console.warn(`[${device.id}] 空のデータを受信しました`);
                  return;
                }
                const data = charProfile.parser(target.value, device.id);
                this.onDataReceived?.(device.id, data);
              } catch (parseError) {
                console.error(`[${device.id}] データ解析エラー:`, parseError);
              }
            });
            console.log(`[${device.id}] Notifications started for ${key}`);
          }

        } catch (charError) {
          console.warn(`[${device.id}] 特性値'${key}'の設定に失敗:`, charError);
        }
      }

      const sensor: ConnectedSensor = {
        id: device.id,
        name: device.name,
        type: sensorType,
        device,
        data: {}
      };

      this.connectedDevices.set(device.id, device);
      device.addEventListener('gattserverdisconnected', () => this.handleDisconnection(device.id));

      console.log(`[${device.id}] Sensor connection completed successfully`);
      return sensor;

    } catch (error) {
      console.error('センサーの接続に失敗しました:', error);
      toast.error(`センサーの接続に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      // 接続失敗時はデバイスを切断
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
      throw error;
    }
  }

  private async identifySensorType(server: BluetoothRemoteGATTServer): Promise<SensorType> {
    // 利用可能なサービスから種別を特定
    for (const [type, profile] of Object.entries(SENSOR_PROFILES)) {
      try {
        // iPad対応: サービス取得前に遅延
        await delay(500);
        
        await server.getPrimaryService(profile.serviceUUID);
        console.log(`[センサー識別] ${type} サービスが見つかりました: ${profile.serviceUUID}`);
        return type as SensorType;
      } catch {
        // サービスが見つからない場合は次を試す
        continue;
      }
    }
    throw new Error('サポートされていないセンサーです');
  }

  private handleDisconnection(deviceId: string) {
    this.connectedDevices.delete(deviceId);
    // センサー切断時にケイデンス計算器も削除
    cadenceCalculatorManager.removeCalculator(deviceId);
    toast.error('センサーが切断されました');
  }

  async disconnectSensor(deviceId: string) {
    const device = this.connectedDevices.get(deviceId);
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    this.connectedDevices.delete(deviceId);
    // センサー切断時にケイデンス計算器も削除
    cadenceCalculatorManager.removeCalculator(deviceId);
  }

  isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  // デバッグ用: 模擬データ生成
  startMockData(sensorType: SensorType, deviceId: string) {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      let mockData: Record<string, number> = {};
      
      switch (sensorType) {
        case 'CyclingPower':
          mockData = { 
            power: Math.floor(Math.random() * 100) + 150, // 150-250W
            cadence: Math.floor(Math.random() * 20) + 80   // 80-100rpm
          };
          break;
        case 'HeartRate':
          mockData = { value: Math.floor(Math.random() * 40) + 140 }; // 140-180bpm
          break;
        case 'CyclingSpeedCadence':
          mockData = { value: Math.floor(Math.random() * 20) + 80 }; // 80-100rpm
          break;
        case 'CoreBodyTemperature':
          mockData = { 
            coreTemperature: 36.5 + Math.random() * 2, // 36.5-38.5°C
            skinTemperature: 32.0 + Math.random() * 3   // 32.0-35.0°C
          };
          break;
        case 'MuscleoxygenSensor':
          mockData = {
            smo2: Math.floor(Math.random() * 30) + 60, // 60-90%
            thb: 12.0 + Math.random() * 3              // 12.0-15.0 g/dl
          };
          break;
      }
      
      this.onDataReceived?.(deviceId, mockData);
    }, 1000);

    // 30秒後に停止
    setTimeout(() => clearInterval(interval), 30000);
  }
}

export const bleService = new BLEService();
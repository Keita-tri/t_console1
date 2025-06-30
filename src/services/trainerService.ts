import toast from 'react-hot-toast';
import { ConnectedTrainer, TrainerCommand, FTMSCommand } from '../types';
import { enqueueBleCommand, enqueueDeviceCommand } from './commandQueue';

/**
 * Trainer Service - スマートトレーナーとの通信を管理
 * 
 * 改善点:
 * 1. bleService.ts と同様の最適化を適用
 * 2. コマンドキューによる安定した非同期処理
 * 3. 堅牢なエラーハンドリング
 * 4. FTMS プロトコルの安定した実装
 */

// FTMS Bluetooth specifications
export const BluetoothSpecs = {
  FTMS_SERVICE_UUID: '00001826-0000-1000-8000-00805f9b34fb',
  INDOOR_BIKE_DATA_UUID: '00002ad2-0000-1000-8000-00805f9b34fb',
  CONTROL_POINT_UUID: '00002ad9-0000-1000-8000-00805f9b34fb',
};

class TrainerService {
  private connectedTrainers: Map<string, ConnectedTrainer> = new Map();
  private onStatusUpdate?: (trainerId: string, status: any) => void;
  private onDataReceived?: (trainerId: string, data: Record<string, number>) => void;

  setStatusCallback(callback: (trainerId: string, status: any) => void) {
    this.onStatusUpdate = callback;
  }

  setDataCallback(callback: (trainerId: string, data: Record<string, number>) => void) {
    this.onDataReceived = callback;
  }

  /**
   * トレーナーをスキャンして検出
   */
  async scanForTrainers(): Promise<BluetoothDevice[]> {
    return enqueueBleCommand(async () => {
      try {
        console.log('[Trainer Service] Scanning for FTMS trainers...');
        
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BluetoothSpecs.FTMS_SERVICE_UUID] }],
          optionalServices: [BluetoothSpecs.FTMS_SERVICE_UUID]
        });

        console.log(`[Trainer Service] Found trainer: ${device.name || device.id}`);
        return [device];
      } catch (error) {
        console.error('[Trainer Service] Trainer scan failed:', error);
        if (error instanceof Error && error.name !== 'NotFoundError') {
          toast.error('Failed to scan for trainers');
        }
        throw error;
      }
    }, 'Scan for trainers');
  }

  /**
   * トレーナーに接続（最適化版）
   */
  async connectTrainer(device: BluetoothDevice): Promise<ConnectedTrainer> {
    return enqueueDeviceCommand(async () => {
      try {
        console.log(`[${device.id}] Connecting to trainer: ${device.name || device.id}`);
        
        // ★ 改善点①: GATT接続
        const server = await this.connectToGATTServer(device);
        
        // ★ 改善点②: サービス取得を一度だけ実行
        const service = await this.getFTMSService(server, device.id);
        
        // ★ 改善点③: 特性値の設定（最適化されたアプローチ）
        const { controlPoint } = await this.setupTrainerCharacteristics(device, service);

        // トレーナーオブジェクトの作成
        const trainer: ConnectedTrainer = {
          id: device.id,
          name: device.name,
          type: 'SmartTrainer',
          device,
          profile: {
            serviceUUID: BluetoothSpecs.FTMS_SERVICE_UUID,
            characteristics: {
              control: {
                uuid: BluetoothSpecs.CONTROL_POINT_UUID,
                writeType: 'writeWithResponse'
              },
              status: {
                uuid: BluetoothSpecs.CONTROL_POINT_UUID
              },
              indoorBikeData: {
                uuid: BluetoothSpecs.INDOOR_BIKE_DATA_UUID
              }
            },
            capabilities: {
              maxPower: 2000,
              minPower: 0,
              powerResolution: 1,
              supportsERG: true,
              supportsResistance: true,
              supportsSlope: true
            }
          },
          status: {
            currentPower: null,
            targetPower: null,
            mode: 'Manual',
            isCalibrated: false,
            connectionState: 'connected',
            lastResponse: 'Connected'
          },
          controlPoint
        };

        this.connectedTrainers.set(device.id, trainer);
        
        // 切断イベントの監視
        device.addEventListener('gattserverdisconnected', () => {
          this.handleDisconnection(device.id);
        });

        // ★ 改善点④: ハンドシェイクの実行
        await this.performHandshake(trainer);

        console.log(`[${device.id}] Trainer connected successfully`);
        return trainer;

      } catch (error) {
        console.error(`[${device.id}] Trainer connection failed:`, error);
        toast.error(`Failed to connect trainer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }, `Connect trainer ${device.name || device.id}`);
  }

  /**
   * GATT サーバーへの接続
   */
  private async connectToGATTServer(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer> {
    return enqueueBleCommand(async () => {
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }
      console.log(`[${device.id}] GATT server connected`);
      return server;
    }, `GATT connect ${device.id}`, true);
  }

  /**
   * FTMS サービスの取得
   */
  private async getFTMSService(
    server: BluetoothRemoteGATTServer, 
    deviceId: string
  ): Promise<BluetoothRemoteGATTService> {
    return enqueueBleCommand(async () => {
      console.log(`[${deviceId}] Getting FTMS service`);
      const service = await server.getPrimaryService(BluetoothSpecs.FTMS_SERVICE_UUID);
      console.log(`[${deviceId}] FTMS service acquired`);
      return service;
    }, `Get FTMS service ${deviceId}`, true);
  }

  /**
   * トレーナー特性値の設定（最適化版）
   */
  private async setupTrainerCharacteristics(
    device: BluetoothDevice,
    service: BluetoothRemoteGATTService
  ): Promise<{ controlPoint: BluetoothRemoteGATTCharacteristic }> {
    console.log(`[${device.id}] Setting up trainer characteristics...`);

    // Control Point 特性の設定
    const controlPoint = await enqueueBleCommand(async () => {
      const characteristic = await service.getCharacteristic(BluetoothSpecs.CONTROL_POINT_UUID);
      
      // 通知の開始
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleControlResponse(device.id, event);
      });
      
      console.log(`[${device.id}] Control Point notifications enabled`);
      return characteristic;
    }, `Setup Control Point ${device.id}`, false);

    // Indoor Bike Data 特性の設定（オプション）
    try {
      await enqueueBleCommand(async () => {
        const indoorBikeData = await service.getCharacteristic(BluetoothSpecs.INDOOR_BIKE_DATA_UUID);
        
        await indoorBikeData.startNotifications();
        indoorBikeData.addEventListener('characteristicvaluechanged', (event) => {
          this.handleIndoorBikeData(device.id, event);
        });
        
        console.log(`[${device.id}] Indoor Bike Data notifications enabled`);
      }, `Setup Indoor Bike Data ${device.id}`, false);
    } catch (error) {
      console.warn(`[${device.id}] Indoor Bike Data characteristic not available:`, error);
    }

    return { controlPoint };
  }

  /**
   * トレーナーとのハンドシェイク
   */
  private async performHandshake(trainer: ConnectedTrainer): Promise<void> {
    try {
      console.log(`[${trainer.id}] Starting trainer handshake...`);
      
      // Step 1: Request Control
      await this.sendFTMSCommand(trainer, { opCode: 0x01 }, 'Request Control');
      
      // Step 2: Start Training
      await this.sendFTMSCommand(trainer, { opCode: 0x07 }, 'Start Training');
      
      this.updateTrainerStatus(trainer.id, {
        lastResponse: 'Handshake completed',
        isCalibrated: true
      });
      
      console.log(`[${trainer.id}] Trainer handshake completed`);
    } catch (error) {
      console.error(`[${trainer.id}] Handshake failed:`, error);
      this.updateTrainerStatus(trainer.id, {
        lastResponse: 'Handshake failed'
      });
    }
  }

  /**
   * トレーナーの切断
   */
  async disconnectTrainer(trainerId: string): Promise<void> {
    return enqueueBleCommand(async () => {
      const trainer = this.connectedTrainers.get(trainerId);
      if (trainer?.device.gatt?.connected) {
        trainer.device.gatt.disconnect();
      }
      this.connectedTrainers.delete(trainerId);
      console.log(`[${trainerId}] Trainer disconnected`);
    }, `Disconnect trainer ${trainerId}`);
  }

  /**
   * トレーナーコマンドの送信
   */
  async sendCommand(trainerId: string, command: TrainerCommand): Promise<void> {
    const trainer = this.connectedTrainers.get(trainerId);
    if (!trainer || !trainer.device.gatt?.connected) {
      throw new Error('Trainer not connected');
    }

    return enqueueBleCommand(async () => {
      try {
        let ftmsCommand: FTMSCommand;
        
        switch (command.type) {
          case 'setPower':
            const powerBytes = this.numberToBytes(command.value || 0, 2);
            ftmsCommand = { opCode: 0x05, parameters: powerBytes };
            break;
          case 'setResistance':
            ftmsCommand = { opCode: 0x04, parameters: [command.value || 0] };
            break;
          case 'setSlope':
            const slopeValue = Math.round((command.value || 0) * 100);
            const slopeBytes = this.numberToBytes(slopeValue, 2, true);
            ftmsCommand = { opCode: 0x06, parameters: slopeBytes };
            break;
          case 'stop':
            ftmsCommand = { opCode: 0x02 };
            break;
          case 'requestControl':
            ftmsCommand = { opCode: 0x01 };
            break;
          case 'startTraining':
            ftmsCommand = { opCode: 0x07 };
            break;
          default:
            throw new Error(`Unsupported command type: ${command.type}`);
        }

        await this.sendFTMSCommand(trainer, ftmsCommand, `${command.type} command`);
        
        // トレーナー状態の更新
        this.updateTrainerStatusFromCommand(trainerId, command);

      } catch (error) {
        console.error(`[${trainerId}] Failed to send trainer command:`, error);
        toast.error('Failed to send command to trainer');
        throw error;
      }
    }, `Send command ${command.type} to ${trainerId}`);
  }

  /**
   * FTMS コマンドの送信
   */
  private async sendFTMSCommand(
    trainer: ConnectedTrainer, 
    command: FTMSCommand, 
    description?: string
  ): Promise<void> {
    return enqueueBleCommand(async () => {
      if (!trainer.controlPoint) {
        throw new Error('Control Point not available');
      }

      const data = new Uint8Array([command.opCode, ...(command.parameters || [])]);
      console.log(`[${trainer.id}] Sending FTMS command (${description}): [${Array.from(data).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);
      
      await trainer.controlPoint.writeValue(data);
    }, `Send FTMS command ${description}`, false);
  }

  /**
   * Control Point レスポンスの処理（堅牢化版）
   */
  private handleControlResponse(trainerId: string, event: Event): void {
    try {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      if (!target.value) return;

      const data = new Uint8Array(target.value.buffer);
      console.log(`[${trainerId}] Control response: [${Array.from(data).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);
      
      if (data.length >= 3) {
        const responseCode = data[0];
        const requestOpCode = data[1];
        const resultCode = data[2];
        
        let statusMessage = '';
        if (responseCode === 0x80) { // Response Code
          if (resultCode === 0x01) {
            statusMessage = 'Command successful';
          } else {
            statusMessage = `Command failed (${resultCode})`;
            this.revertToLastSuccessfulValues(trainerId);
          }
        }
        
        this.updateTrainerStatus(trainerId, {
          lastResponse: statusMessage
        });
      }
    } catch (error) {
      console.error(`[${trainerId}] Error handling control response:`, error);
    }
  }

  /**
   * Indoor Bike Data の処理（堅牢化版）
   */
  private handleIndoorBikeData(trainerId: string, event: Event): void {
    try {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      if (!target.value) return;

      const dataView = new DataView(target.value.buffer);
      
      if (dataView.byteLength >= 4) {
        const flags = dataView.getUint16(0, true);
        const instantaneousPower = dataView.getUint16(2, true);
        
        const data = {
          power: instantaneousPower,
          timestamp: Date.now()
        };
        
        this.onDataReceived?.(trainerId, data);
        
        this.updateTrainerStatus(trainerId, {
          currentPower: instantaneousPower
        });
      }
    } catch (error) {
      console.error(`[${trainerId}] Failed to parse Indoor Bike Data:`, error);
    }
  }

  /**
   * 数値をバイト配列に変換
   */
  private numberToBytes(value: number, byteCount: number, signed: boolean = false): number[] {
    const bytes: number[] = [];
    let workingValue = value;
    
    if (signed && value < 0) {
      workingValue = (1 << (byteCount * 8)) + value;
    }
    
    for (let i = 0; i < byteCount; i++) {
      bytes.push(workingValue & 0xFF);
      workingValue >>= 8;
    }
    
    return bytes;
  }

  /**
   * コマンドに基づくトレーナー状態の更新
   */
  private updateTrainerStatusFromCommand(trainerId: string, command: TrainerCommand): void {
    const updates: Partial<ConnectedTrainer['status']> = {};
    
    switch (command.type) {
      case 'setPower':
        updates.targetPower = command.value || null;
        updates.mode = 'ERG';
        break;
      case 'setResistance':
        updates.mode = 'Resistance';
        break;
      case 'setSlope':
        updates.mode = 'Slope';
        break;
      case 'stop':
        updates.targetPower = null;
        updates.mode = 'Manual';
        break;
    }
    
    this.updateTrainerStatus(trainerId, updates);
  }

  /**
   * 最後の成功値への復帰
   */
  private revertToLastSuccessfulValues(trainerId: string): void {
    console.log(`[${trainerId}] Reverting to last successful values`);
    // 実装は必要に応じて追加
  }

  /**
   * トレーナー状態の更新
   */
  private updateTrainerStatus(trainerId: string, updates: Partial<ConnectedTrainer['status']>): void {
    const trainer = this.connectedTrainers.get(trainerId);
    if (trainer) {
      trainer.status = { ...trainer.status, ...updates };
      this.onStatusUpdate?.(trainerId, trainer.status);
    }
  }

  /**
   * 切断イベントの処理
   */
  private handleDisconnection(trainerId: string): void {
    this.connectedTrainers.delete(trainerId);
    toast.error('Trainer disconnected');
    console.log(`[${trainerId}] Trainer disconnected unexpectedly`);
  }

  /**
   * Bluetooth サポートの確認
   */
  isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): any {
    return {
      connectedTrainersCount: this.connectedTrainers.size,
      connectedTrainerIds: Array.from(this.connectedTrainers.keys()),
      isBluetoothSupported: this.isBluetoothSupported()
    };
  }
}

export const trainerService = new TrainerService();
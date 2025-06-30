import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from '../components/layout/MainLayout';
import { useAppStore } from '../store/useAppStore';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { bleService } from '../services/bleService';
import { GlobalStyle } from '../styles/globalStyles';
import { SensorType } from '../types';
import toast from 'react-hot-toast';

function App() {
  const { connectedSensors, actions } = useAppStore();
  const { elapsedTime, status, startSession, stopSession, pauseSession, addLap } = useSessionTimer();
  
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingDevices, setConnectingDevices] = useState<Set<string>>(new Set());

  const connectedSensorsList = Object.values(connectedSensors);

  // ★ リロード防止機能を復元
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // ★ 修正: 常時リロード防止（センサー接続中やデータがある場合）
      const hasConnectedSensors = connectedSensorsList.length > 0;
      const hasSessionData = status !== 'stopped';
      
      if (hasConnectedSensors || hasSessionData) {
        event.preventDefault();
        // Chromeでは以下の設定が必要
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status, connectedSensorsList.length]); // センサー接続状態も監視

  // BLEサービスの初期化
  useEffect(() => {
    if (!bleService.isBluetoothSupported()) {
      toast.error('This browser does not support Web Bluetooth API');
      return;
    }

    // データ受信コールバックの設定
    bleService.setDataCallback((sensorId: string, data: Record<string, number>) => {
      actions.updateSensorData(sensorId, data);
    });
  }, [actions]);

  const handleScanSensors = async (targetSensorType?: SensorType) => {
    setIsScanning(true);
    try {
      const devices = await bleService.scanForSensors(targetSensorType);
      if (devices.length === 0) {
        const sensorTypeText = targetSensorType ? getSensorTypeDisplayName(targetSensorType) : 'sensors';
        toast.error(`No ${sensorTypeText} found`);
        setAvailableDevices([]);
      } else {
        // ★ 修正: デバイスが見つかったら自動的に接続を試行
        const sensorTypeText = targetSensorType ? getSensorTypeDisplayName(targetSensorType) : 'sensor(s)';
        toast.success(`Found ${devices.length} ${sensorTypeText}, connecting...`);
        
        // 複数のデバイスが見つかった場合は最初のデバイスに自動接続
        const deviceToConnect = devices[0];
        await handleConnectSensor(deviceToConnect);
        
        // 残りのデバイスがあれば利用可能デバイスリストに追加
        if (devices.length > 1) {
          setAvailableDevices(devices.slice(1));
        } else {
          setAvailableDevices([]);
        }
      }
    } catch (error) {
      console.error('Sensor scan failed:', error);
      const sensorTypeText = targetSensorType ? getSensorTypeDisplayName(targetSensorType) : 'sensors';
      toast.error(`Failed to scan for ${sensorTypeText}`);
      setAvailableDevices([]);
    } finally {
      setIsScanning(false);
    }
  };

  const getSensorTypeDisplayName = (sensorType: SensorType): string => {
    const displayNames: Record<SensorType, string> = {
      'HeartRate': 'heart rate monitors',
      'CyclingPower': 'power meters',
      'CyclingSpeedCadence': 'speed & cadence sensors',
      'CoreBodyTemperature': 'temperature sensors',
      'MuscleoxygenSensor': 'muscle oxygen sensors',
      'SmartTrainer': 'smart trainers'
    };
    return displayNames[sensorType] || sensorType;
  };

  const handleConnectSensor = async (device: BluetoothDevice) => {
    setConnectingDevices(prev => new Set(prev).add(device.id));
    
    try {
      const sensor = await bleService.connectSensor(device);
      actions.addSensor(sensor);
      // ★ 修正: 接続成功時は利用可能デバイスリストから削除
      setAvailableDevices(prev => prev.filter(d => d.id !== device.id));
      toast.success(`${device.name || 'Sensor'} connected`);
    } catch (error) {
      console.error('Sensor connection failed:', error);
      toast.error('Sensor connection failed');
    } finally {
      setConnectingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(device.id);
        return newSet;
      });
    }
  };

  const handleDisconnectSensor = async (sensorId: string) => {
    try {
      await bleService.disconnectSensor(sensorId);
      actions.removeSensor(sensorId);
      toast.success('Sensor disconnected');
    } catch (error) {
      console.error('Sensor disconnection failed:', error);
      toast.error('Sensor disconnection failed');
    }
  };

  const handleOpenSensorModal = () => {
    console.log('handleOpenSensorModal called in App.tsx');
    setShowSensorModal(true);
  };

  return (
    <>
      <GlobalStyle />
      <MainLayout
        connectedSensors={connectedSensorsList}
        session={{ elapsedTime, status }}
        onStartSession={startSession}
        onStopSession={stopSession}
        onPauseSession={pauseSession}
        onAddLap={addLap}
        onShowSensorModal={handleOpenSensorModal}
        sensorModal={{
          isOpen: showSensorModal,
          onClose: () => {
            setShowSensorModal(false);
            setAvailableDevices([]);
          },
          availableDevices,
          isScanning,
          connectingDevices,
          onScan: handleScanSensors,
          onConnect: handleConnectSensor,
          onDisconnect: handleDisconnectSensor
        }}
      />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#e2e8f0',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000000 // 最高のz-index
          }
        }}
        containerStyle={{
          zIndex: 1000000 // コンテナにも最高のz-index
        }}
      />
    </>
  );
}

export default App;
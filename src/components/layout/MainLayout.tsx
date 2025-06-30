import React, { useState } from 'react';
import styled from 'styled-components';
import { Dashboard } from '../dashboard/Dashboard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConnectedSensor, SavedSensorInfo, SensorType } from '../../types';
import { Activity, Bluetooth, Play, Pause, Square, Plus, Timer, Loader, Info, History, Trash2, Edit3, Star, Maximize, Minimize, Zap, Users, Link, Download, BarChart3, ChevronDown, Settings, Droplets } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ValueFormatter } from '../../utils/dataCalculations';
import { SensorAssignmentModal } from './SensorAssignmentModal';

interface MainLayoutProps {
  connectedSensors: ConnectedSensor[];
  session: {
    elapsedTime: number;
    status: 'stopped' | 'running' | 'paused';
  };
  onStartSession: () => void;
  onStopSession: () => void;
  onPauseSession: () => void;
  onAddLap: () => void;
  onShowSensorModal: () => void;
  sensorModal: {
    isOpen: boolean;
    onClose: () => void;
    availableDevices: BluetoothDevice[];
    isScanning: boolean;
    connectingDevices: Set<string>;
    onScan: (targetSensorType?: SensorType) => void;
    onConnect: (device: BluetoothDevice) => void;
    onDisconnect: (sensorId: string) => void;
  };
}

const AppContainer = styled.div<{ $isTrainingMode: boolean }>`
  min-height: 100vh;
  background: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'linear-gradient(135deg, #000000 0%, #0f0f23 50%, #1a1a2e 100%)' 
      : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
  };
  padding: ${({ $isTrainingMode }) => $isTrainingMode ? '0' : '20px'};
  transition: all 300ms ease;
`;

const Header = styled.header<{ $isTrainingMode: boolean }>`
  background: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'rgba(0, 0, 0, 0.9)' 
      : 'rgba(30, 41, 59, 0.9)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'rgba(59, 130, 246, 0.3)' 
      : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: ${({ $isTrainingMode }) => $isTrainingMode ? '0' : '16px'};
  padding: 16px 24px;
  margin-bottom: ${({ $isTrainingMode }) => $isTrainingMode ? '0' : '20px'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${({ $isTrainingMode }) => $isTrainingMode && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 300ms ease;
    
    &:hover {
      opacity: 1;
    }
  `}
`;

const Logo = styled.h1<{ $isTrainingMode: boolean }>`
  font-size: ${({ $isTrainingMode }) => $isTrainingMode ? '1.25rem' : '1.5rem'};
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderControls = styled.div<{ $isTrainingMode: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $isTrainingMode }) => $isTrainingMode ? '8px' : '12px'};
  flex-wrap: wrap;
`;

const SessionInfo = styled.div<{ $isTrainingMode: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $isTrainingMode }) => $isTrainingMode ? '8px' : '16px'};
  padding: ${({ $isTrainingMode }) => $isTrainingMode ? '6px 12px' : '8px 16px'};
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const SessionTime = styled.span<{ $isTrainingMode: boolean }>`
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: ${({ $isTrainingMode }) => $isTrainingMode ? '1rem' : '1.125rem'};
  font-weight: 600;
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
`;

const SessionStatus = styled.span<{ $status: string; $isTrainingMode: boolean }>`
  font-size: ${({ $isTrainingMode }) => $isTrainingMode ? '0.75rem' : '0.875rem'};
  font-weight: 500;
  color: ${({ $status }) => 
    $status === 'running' ? '#10b981' : 
    $status === 'paused' ? '#f59e0b' : '#94a3b8'
  };
  text-shadow: 0 0 8px ${({ $status }) => 
    $status === 'running' ? 'rgba(16, 185, 129, 0.5)' : 
    $status === 'paused' ? 'rgba(245, 158, 11, 0.5)' : 'transparent'
  };
`;

const ConnectedSensorsList = styled.div<{ $isTrainingMode: boolean }>`
  display: ${({ $isTrainingMode }) => $isTrainingMode ? 'none' : 'flex'};
  flex-wrap: wrap;
  gap: 8px;
`;

const ConnectedSensorBadge = styled.div<{ $userColor?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${({ $userColor }) => $userColor ? `${$userColor}40` : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  color: ${({ $userColor }) => $userColor || 'white'};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 8px ${({ $userColor }) => $userColor ? `${$userColor}30` : 'rgba(16, 185, 129, 0.3)'};
  border: 1px solid ${({ $userColor }) => $userColor ? `${$userColor}60` : 'rgba(16, 185, 129, 0.3)'};
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
`;

const MainContent = styled.main<{ $isTrainingMode: boolean }>`
  background: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'transparent' 
      : 'rgba(30, 41, 59, 0.6)'
  };
  backdrop-filter: ${({ $isTrainingMode }) => $isTrainingMode ? 'none' : 'blur(20px)'};
  border: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'none' 
      : '1px solid rgba(59, 130, 246, 0.1)'
  };
  border-radius: ${({ $isTrainingMode }) => $isTrainingMode ? '0' : '16px'};
  min-height: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? '100vh' 
      : 'calc(100vh - 140px)'
  };
  overflow: hidden;
  ${({ $isTrainingMode }) => $isTrainingMode && `
    padding-top: 80px;
  `}
  ${({ $isTrainingMode }) => !$isTrainingMode && `
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  `}
`;

const TrainingModeExitButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.8);
  color: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0.3;
  transition: all 300ms ease;
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  &:hover {
    opacity: 1;
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;

// ★ 新しいスタイル: エクスポートセクション
const ExportSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const ExportInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ExportTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
`;

const ExportStats = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

// Sensor modal components (keeping existing styles)
const SensorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const SensorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(30, 41, 59, 0.7);
  }
`;

const SensorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SensorName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
`;

const SensorTypeSpan = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const SensorDataDisplay = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const DataRow = styled.div`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
`;

const DataLabel = styled.span`
  color: #94a3b8;
  font-weight: 500;
`;

const DataValue = styled.span`
  color: #e2e8f0;
  font-weight: 600;
`;

const RawDataSection = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: #10b981;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  word-break: break-all;
  border: 1px solid rgba(16, 185, 129, 0.3);
`;

const SensorActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 20px;
  background: rgba(15, 15, 35, 0.5);
  border-radius: 8px 8px 0 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.3)' : 'transparent'};
  color: ${({ $active }) => $active ? '#e2e8f0' : '#94a3b8'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 200ms ease;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)'};
    color: #e2e8f0;
  }
`;

const SavedSensorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(30, 41, 59, 0.7);
  }
`;

const SavedSensorInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const SavedSensorName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SavedSensorDetails = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const SavedSensorActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AliasInput = styled.input`
  padding: 4px 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  width: 120px;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const AssignmentBadge = styled.div<{ $userColor: string }>`
  padding: 2px 6px;
  background: ${({ $userColor }) => `${$userColor}20`};
  color: ${({ $userColor }) => $userColor};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid ${({ $userColor }) => `${$userColor}40`};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MultiUserModeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 500;
`;

// ★ 新しいスタイル: センサースキャンセクション
const ScanSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 20px;
`;

const ScanSectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScanSectionDescription = styled.p`
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`;

const ScanButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ScanTypeButton = styled.button<{ $isScanning: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 200ms ease;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScanTypeIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
`;

const ScanTypeLabel = styled.span`
  font-weight: 600;
`;

const ScanTypeDescription = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.3;
`;

function formatLastConnected(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  connectedSensors,
  session,
  onStartSession,
  onStopSession,
  onPauseSession,
  onAddLap,
  onShowSensorModal,
  sensorModal
}) => {
  const { isTrainingMode, connectedTrainers, userProfiles, savedSensors, actions } = useAppStore();
  const [showSensorDetails, setShowSensorDetails] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'connected' | 'saved'>('connected');
  const [editingAlias, setEditingAlias] = useState<string | null>(null);
  const [aliasValue, setAliasValue] = useState('');
  const [showSensorAssignment, setShowSensorAssignment] = useState(false);

  const savedSensorsList = actions.getSavedSensors();
  const hasConnectedTrainer = Object.keys(connectedTrainers).length > 0;

  // マルチユーザーモードの判定を統一
  const isMultiUserMode = actions.getIsMultiUserMode();
  const activeUserCount = actions.getActiveUserCount();

  // ★ エクスポート関連の状態を取得
  const hasExportableData = actions.hasExportableData();
  const exportStats = hasExportableData ? actions.getExportStats() : null;

  const handleSessionControl = () => {
    if (session.status === 'stopped') {
      onStartSession();
    } else if (session.status === 'running') {
      onPauseSession();
    } else if (session.status === 'paused') {
      onStartSession();
    }
  };

  const getSessionButtonIcon = () => {
    if (session.status === 'stopped') return <Play size={16} />;
    if (session.status === 'running') return <Pause size={16} />;
    return <Play size={16} />;
  };

  const getSessionButtonText = () => {
    if (session.status === 'stopped') return 'Start';
    if (session.status === 'running') return 'Pause';
    return 'Resume';
  };

  // ★ エクスポートボタンのハンドラー
  const handleExportData = () => {
    actions.exportSessionData();
  };

  // ★ データクリアボタンのハンドラー
  const handleClearData = () => {
    if (window.confirm('セッションデータをクリアしますか？この操作は元に戻せません。')) {
      actions.clearAllSessionData();
    }
  };

  const toggleSensorDetails = (sensorId: string) => {
    setShowSensorDetails(prev => ({
      ...prev,
      [sensorId]: !prev[sensorId]
    }));
  };

  const handleEditAlias = (sensorId: string, currentAlias?: string) => {
    setEditingAlias(sensorId);
    setAliasValue(currentAlias || '');
  };

  const handleSaveAlias = (sensorId: string) => {
    actions.updateSensorAlias(sensorId, aliasValue);
    setEditingAlias(null);
    setAliasValue('');
  };

  const handleRemoveSavedSensor = (sensorId: string) => {
    if (window.confirm('Remove this saved sensor?')) {
      actions.removeSavedSensor(sensorId);
    }
  };

  const getAssignedUser = (sensorId: string) => {
    const assignedUserId = savedSensors[sensorId]?.assignedUserId;
    return assignedUserId ? userProfiles[assignedUserId] : null;
  };

  const getSensorDisplayName = (sensor: ConnectedSensor) => {
    const assignedUser = getAssignedUser(sensor.id);
    const savedSensor = savedSensors[sensor.id];
    
    // Priority: userAlias > device name > formatted sensor type
    let baseName = savedSensor?.userAlias || sensor.name || ValueFormatter.formatSensorTypeName(sensor.type);
    
    return assignedUser && isMultiUserMode ? `${baseName} (${assignedUser.name})` : baseName;
  };

  const getSensorBadgeColor = (sensor: ConnectedSensor) => {
    if (!isMultiUserMode) return undefined;
    const assignedUser = getAssignedUser(sensor.id);
    return assignedUser?.color;
  };

  // ★ 新しい関数: センサータイプ別スキャン
  const handleScanSpecificSensorType = (sensorType: SensorType) => {
    sensorModal.onScan(sensorType);
  };

  const handleScanAllSensors = () => {
    sensorModal.onScan();
  };

  const renderSensorData = (sensor: ConnectedSensor) => {
    if (!showSensorDetails[sensor.id]) return null;

    return (
      <SensorDataDisplay>
        {sensor.type === 'CyclingPower' && (
          <>
            <DataRow>
              <DataLabel>Power:</DataLabel>
              <DataValue>{sensor.data?.power || 0} W</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Cadence:</DataLabel>
              <DataValue>{sensor.data?.cadence || '--'} rpm</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Flags:</DataLabel>
              <DataValue>{sensor.data?.flags || '--'}</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Data Length:</DataLabel>
              <DataValue>{sensor.data?.dataLength || 0} bytes</DataValue>
            </DataRow>
            {sensor.data?.flagDetails && (
              <DataRow>
                <DataLabel>Flag Details:</DataLabel>
                <DataValue style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                  {sensor.data.flagDetails}
                </DataValue>
              </DataRow>
            )}
            {sensor.data?.rawData && (
              <RawDataSection>
                <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>RAW Data:</div>
                <div>{sensor.data.rawData}</div>
              </RawDataSection>
            )}
          </>
        )}
        {sensor.type === 'HeartRate' && (
          <DataRow>
            <DataLabel>Heart Rate:</DataLabel>
            <DataValue>{sensor.data?.value || 0} bpm</DataValue>
          </DataRow>
        )}
        {sensor.type === 'CyclingSpeedCadence' && (
          <DataRow>
            <DataLabel>Cadence:</DataLabel>
            <DataValue>{sensor.data?.value || 0} rpm</DataValue>
          </DataRow>
        )}
        {sensor.type === 'CoreBodyTemperature' && (
          <>
            <DataRow>
              <DataLabel>Core Temp:</DataLabel>
              <DataValue>{sensor.data?.coreTemperature?.toFixed(1) || '--'} °C</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Skin Temp:</DataLabel>
              <DataValue>{sensor.data?.skinTemperature?.toFixed(1) || '--'} °C</DataValue>
            </DataRow>
          </>
        )}
        {sensor.type === 'MuscleoxygenSensor' && (
          <>
            <DataRow>
              <DataLabel>SmO2:</DataLabel>
              <DataValue>{sensor.data?.smo2?.toFixed(1) || '--'} %</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>tHb:</DataLabel>
              <DataValue>{sensor.data?.thb?.toFixed(2) || '--'} g/dl</DataValue>
            </DataRow>
          </>
        )}
      </SensorDataDisplay>
    );
  };

  return (
    <AppContainer $isTrainingMode={isTrainingMode}>
      <Header $isTrainingMode={isTrainingMode}>
        <Logo $isTrainingMode={isTrainingMode}>
          <Activity size={isTrainingMode ? 20 : 24} />
          {!isTrainingMode && 'Training Console'}
        </Logo>
        
        <HeaderControls $isTrainingMode={isTrainingMode}>
          {!isTrainingMode && isMultiUserMode && (
            <MultiUserModeIndicator>
              <Users size={12} />
              Multi-User Mode
            </MultiUserModeIndicator>
          )}

          {!isTrainingMode && connectedSensors.length > 0 && (
            <ConnectedSensorsList $isTrainingMode={isTrainingMode}>
              {connectedSensors.map(sensor => (
                <ConnectedSensorBadge 
                  key={sensor.id}
                  $userColor={getSensorBadgeColor(sensor)}
                >
                  <StatusDot />
                  {getSensorDisplayName(sensor)}
                </ConnectedSensorBadge>
              ))}
            </ConnectedSensorsList>
          )}

          {/* ★ エクスポートセクション - セッション停止時のみ表示 */}
          {!isTrainingMode && session.status === 'stopped' && hasExportableData && exportStats && (
            <ExportSection>
              <BarChart3 size={16} />
              <ExportInfo>
                <ExportTitle>Session Data Ready</ExportTitle>
                <ExportStats>
                  {exportStats.sensorCount} sensors • {exportStats.dataPointCount} points • {exportStats.timeSpan}
                </ExportStats>
              </ExportInfo>
              <Button
                variant="primary"
                size="small"
                onClick={handleExportData}
                icon={<Download size={14} />}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleClearData}
                icon={<Trash2 size={14} />}
              >
                Clear
              </Button>
            </ExportSection>
          )}
          
          {session.status !== 'stopped' && (
            <SessionInfo $isTrainingMode={isTrainingMode}>
              <Timer size={isTrainingMode ? 14 : 16} />
              <SessionTime $isTrainingMode={isTrainingMode}>
                {ValueFormatter.formatTime(session.elapsedTime)}
              </SessionTime>
              <SessionStatus $status={session.status} $isTrainingMode={isTrainingMode}>
                {session.status === 'running' ? 'Recording' : 
                 session.status === 'paused' ? 'Paused' : ''}
              </SessionStatus>
            </SessionInfo>
          )}

          {/* Session control buttons */}
          {session.status === 'running' && (
            <Button
              variant="secondary"
              size="small"
              onClick={onAddLap}
              icon={<Plus size={14} />}
            >
              Lap
            </Button>
          )}

          {session.status !== 'stopped' && (
            <Button
              variant="danger"
              size="small"
              onClick={onStopSession}
              icon={<Square size={14} />}
            >
              Stop
            </Button>
          )}

          <Button
            variant={session.status === 'running' ? 'secondary' : 'primary'}
            size={isTrainingMode ? 'small' : 'medium'}
            onClick={handleSessionControl}
            icon={getSessionButtonIcon()}
            disabled={connectedSensors.length === 0}
          >
            {getSessionButtonText()}
          </Button>

          {!isTrainingMode &&  (
            <>
              <Button
                variant="secondary"
                onClick={() => actions.enterTrainingMode()}
                icon={<Maximize size={16} />}
              >
                Training Mode
              </Button>

              <Button
                variant="secondary"
                onClick={onShowSensorModal}
                icon={<Bluetooth size={16} />}
              >
                Sensors
              </Button>
            </>
          )}
        </HeaderControls>
      </Header>

      <MainContent $isTrainingMode={isTrainingMode}>
        <Dashboard onOpenSensorModal={onShowSensorModal} />
      </MainContent>

      {isTrainingMode && (
        <TrainingModeExitButton
          onClick={() => actions.exitTrainingMode()}
          title="Exit Training Mode"
        >
          <Minimize size={20} />
        </TrainingModeExitButton>
      )}

      <Modal
        isOpen={sensorModal.isOpen}
        onClose={sensorModal.onClose}
        title="Sensor Management"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TabContainer>
            <Tab 
              $active={activeTab === 'connected'} 
              onClick={() => setActiveTab('connected')}
            >
              Connected Sensors
            </Tab>
            <Tab 
              $active={activeTab === 'saved'} 
              onClick={() => setActiveTab('saved')}
            >
              Saved Sensors ({savedSensorsList.length})
            </Tab>
          </TabContainer>

          {activeTab === 'connected' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div>
                  <p style={{ color: '#3b82f6', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>
                    Sensor Assignment
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                    Assign sensors to users for individual tracking
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowSensorAssignment(true)}
                  icon={<Link size={14} />}
                >
                  Assign Sensors
                </Button>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#e2e8f0' }}>
                  Currently Connected Sensors
                </h3>
                {connectedSensors.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    No sensors connected
                  </p>
                ) : (
                  <SensorList>
                    {connectedSensors.map(sensor => {
                      const assignedUser = getAssignedUser(sensor.id);
                      const savedSensor = savedSensors[sensor.id];
                      const displayName = savedSensor?.userAlias || sensor.name || 'Unknown Device';
                      
                      return (
                        <SensorItem key={sensor.id}>
                          <div style={{ flex: 1 }}>
                            <SensorInfo>
                              <SensorName>
                                {displayName}
                                {assignedUser && isMultiUserMode && (
                                  <AssignmentBadge $userColor={assignedUser.color}>
                                    <Link size={10} />
                                    {assignedUser.name}
                                  </AssignmentBadge>
                                )}
                              </SensorName>
                              <SensorTypeSpan>{ValueFormatter.formatSensorTypeName(sensor.type)}</SensorTypeSpan>
                            </SensorInfo>
                            {renderSensorData(sensor)}
                          </div>
                          <SensorActions>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => toggleSensorDetails(sensor.id)}
                              icon={<Info size={14} />}
                            >
                              {showSensorDetails[sensor.id] ? 'Hide Details' : 'Show Details'}
                            </Button>
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => sensorModal.onDisconnect(sensor.id)}
                            >
                              Disconnect
                            </Button>
                          </SensorActions>
                        </SensorItem>
                      );
                    })}
                  </SensorList>
                )}
              </div>

              {/* ★ 新しいセクション: iPad対応のセンサースキャン */}
              <ScanSection>
                <ScanSectionTitle>
                  <Bluetooth size={16} />
                  Scan for Sensors
                </ScanSectionTitle>
                <ScanSectionDescription>
                  Choose a specific sensor type for better compatibility with iPad and other devices, or scan for all sensors at once.
                </ScanSectionDescription>
                
                <ScanButtonGrid>
                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('HeartRate')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Activity size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Heart Rate</ScanTypeLabel>
                    <ScanTypeDescription>Heart rate monitors and chest straps</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('CyclingPower')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Zap size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Power Meters</ScanTypeLabel>
                    <ScanTypeDescription>Crank, pedal, and hub power meters</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('SmartTrainer')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Settings size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Smart Trainers</ScanTypeLabel>
                    <ScanTypeDescription>FTMS compatible smart trainers</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('CyclingSpeedCadence')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Timer size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Speed & Cadence</ScanTypeLabel>
                    <ScanTypeDescription>Speed and cadence sensors</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('CoreBodyTemperature')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Star size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Temperature</ScanTypeLabel>
                    <ScanTypeDescription>Core body temperature sensors</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={() => handleScanSpecificSensorType('MuscleoxygenSensor')}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      <Droplets size={16} />
                    </ScanTypeIcon>
                    <ScanTypeLabel>Muscle Oxygen</ScanTypeLabel>
                    <ScanTypeDescription>SmO2 and tHb sensors (Moxy, BSX, etc.)</ScanTypeDescription>
                  </ScanTypeButton>

                  <ScanTypeButton
                    onClick={handleScanAllSensors}
                    disabled={sensorModal.isScanning}
                    $isScanning={sensorModal.isScanning}
                  >
                    <ScanTypeIcon>
                      {sensorModal.isScanning ? <Loader className="loading-icon" size={16} /> : <Bluetooth size={16} />}
                    </ScanTypeIcon>
                    <ScanTypeLabel>All Sensors</ScanTypeLabel>
                    <ScanTypeDescription>
                      {sensorModal.isScanning ? 'Scanning...' : 'Scan for all sensor types'}
                    </ScanTypeDescription>
                  </ScanTypeButton>
                </ScanButtonGrid>
                
                {sensorModal.availableDevices.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
                      Additional Sensors Found
                    </h4>
                    <SensorList>
                      {sensorModal.availableDevices.map(device => {
                        const isConnecting = sensorModal.connectingDevices.has(device.id);
                        return (
                          <SensorItem key={device.id}>
                            <SensorInfo>
                              <SensorName>{device.name || 'Unknown Device'}</SensorName>
                              <SensorTypeSpan>Click to connect</SensorTypeSpan>
                            </SensorInfo>
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => sensorModal.onConnect(device)}
                              disabled={isConnecting}
                              icon={isConnecting ? <Loader className="loading-icon" size={14} /> : undefined}
                            >
                              {isConnecting ? 'Connecting...' : 'Connect'}
                            </Button>
                          </SensorItem>
                        );
                      })}
                    </SensorList>
                  </div>
                )}
              </ScanSection>
            </>
          )}

          {activeTab === 'saved' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#e2e8f0' }}>
                Saved Sensors
              </h3>
              {savedSensorsList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  No saved sensors. Sensors are automatically saved when connected.
                </p>
              ) : (
                <SensorList>
                  {savedSensorsList.map(sensor => {
                    const assignedUser = getAssignedUser(sensor.id);
                    return (
                      <SavedSensorItem key={sensor.id}>
                        <SavedSensorInfoContainer>
                          <SavedSensorName>
                            {sensor.userAlias || sensor.name || 'Unknown Device'}
                            {assignedUser && isMultiUserMode && (
                              <AssignmentBadge $userColor={assignedUser.color}>
                                <Link size={10} />
                                {assignedUser.name}
                              </AssignmentBadge>
                            )}
                          </SavedSensorName>
                          <SavedSensorDetails>
                            {ValueFormatter.formatSensorTypeName(sensor.type)} • 
                            Last connected: {formatLastConnected(sensor.lastConnected)}
                          </SavedSensorDetails>
                          {editingAlias === sensor.id ? (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <AliasInput
                                value={aliasValue}
                                onChange={(e) => setAliasValue(e.target.value)}
                                placeholder="Alias name"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveAlias(sensor.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingAlias(null);
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() => handleSaveAlias(sensor.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setEditingAlias(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : null}
                        </SavedSensorInfoContainer>
                        <SavedSensorActions>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleEditAlias(sensor.id, sensor.userAlias)}
                            icon={<Edit3 size={14} />}
                          >
                            Rename
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleRemoveSavedSensor(sensor.id)}
                            icon={<Trash2 size={14} />}
                          >
                            Remove
                          </Button>
                        </SavedSensorActions>
                      </SavedSensorItem>
                    );
                  })}
                </SensorList>
              )}
            </div>
          )}
        </div>
      </Modal>

      <SensorAssignmentModal
        isOpen={showSensorAssignment}
        onClose={() => setShowSensorAssignment(false)}
      />
    </AppContainer>
  );
};
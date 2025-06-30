import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { ConnectedSensor, SavedSensorInfo, UserProfile } from '../../types';
import { Users, Bluetooth, User, Unlink, Link, Wifi, WifiOff } from 'lucide-react';
import { ValueFormatter } from '../../utils/dataCalculations';

interface SensorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AssignmentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 400px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColumnHeader = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
  padding: 4px;
`;

const UserItem = styled.div<{ $isActive: boolean; $isDragOver?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid ${({ $isActive, $isDragOver }) => 
    $isDragOver ? 'rgba(59, 130, 246, 0.8)' : 
    $isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 8px;
  background: ${({ $isActive, $isDragOver }) => 
    $isDragOver ? 'rgba(59, 130, 246, 0.2)' : 
    $isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.5)'
  };
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  cursor: pointer;
  min-height: 60px;
  
  &:hover {
    border-color: ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.7)' : 'rgba(59, 130, 246, 0.6)'};
    background: ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.7)'};
  }
`;

const UserAvatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0; /* ★ 追加: flexアイテムの縮小を許可 */
`;

const UserName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
  font-size: 0.875rem;
  white-space: nowrap; /* ★ 追加: 改行を防ぐ */
  overflow: hidden; /* ★ 追加: はみ出しを隠す */
  text-overflow: ellipsis; /* ★ 追加: 省略記号を表示 */
`;

const UserStats = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap; /* ★ 追加: 改行を防ぐ */
  overflow: hidden; /* ★ 追加: はみ出しを隠す */
  text-overflow: ellipsis; /* ★ 追加: 省略記号を表示 */
`;

const SensorItem = styled.div<{ $isConnected: boolean; $isDragging?: boolean; $assignedUserId?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid ${({ $isConnected, $assignedUserId }) => 
    $assignedUserId ? 'rgba(16, 185, 129, 0.5)' : 
    $isConnected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(148, 163, 184, 0.3)'
  };
  border-radius: 8px;
  background: ${({ $isConnected, $assignedUserId }) => 
    $assignedUserId ? 'rgba(16, 185, 129, 0.1)' : 
    $isConnected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.3)'
  };
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  cursor: ${({ $isDragging }) => $isDragging ? 'grabbing' : 'grab'};
  opacity: ${({ $isDragging }) => $isDragging ? 0.5 : 1};
  transform: ${({ $isDragging }) => $isDragging ? 'rotate(5deg)' : 'none'};
  min-height: 60px;
  
  &:hover {
    border-color: ${({ $isConnected, $assignedUserId }) => 
      $assignedUserId ? 'rgba(16, 185, 129, 0.7)' : 
      $isConnected ? 'rgba(59, 130, 246, 0.7)' : 'rgba(148, 163, 184, 0.5)'
    };
    transform: ${({ $isDragging }) => $isDragging ? 'rotate(5deg)' : 'translateY(-2px)'};
  }
`;

const SensorIcon = styled.div<{ $isConnected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $isConnected }) => $isConnected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isConnected }) => $isConnected ? '#3b82f6' : '#94a3b8'};
  border: 1px solid ${({ $isConnected }) => $isConnected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.3)'};
  flex-shrink: 0;
`;

const SensorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0; /* ★ 追加: flexアイテムの縮小を許可 */
`;

const SensorName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
  font-size: 0.875rem;
  white-space: nowrap; /* ★ 追加: 改行を防ぐ */
  overflow: hidden; /* ★ 追加: はみ出しを隠す */
  text-overflow: ellipsis; /* ★ 追加: 省略記号を表示 */
`;

const SensorType = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap; /* ★ 追加: 改行を防ぐ */
  overflow: hidden; /* ★ 追加: はみ出しを隠す */
  text-overflow: ellipsis; /* ★ 追加: 省略記号を表示 */
`;

const LiveData = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
  flex-shrink: 0; /* ★ 追加: ライブデータは縮小しない */
`;

const AssignmentBadge = styled.div<{ $userColor: string }>`
  padding: 4px 8px;
  background: ${({ $userColor }) => `${$userColor}20`};
  color: ${({ $userColor }) => $userColor};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid ${({ $userColor }) => `${$userColor}40`};
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* ★ 追加: 改行を防ぐ */
  overflow: hidden; /* ★ 追加: はみ出しを隠す */
  text-overflow: ellipsis; /* ★ 追加: 省略記号を表示 */
  flex-shrink: 0; /* ★ 追加: バッジは縮小しない */
`;

const UnassignButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  color: #ef4444;
  flex-shrink: 0; /* ★ 追加: ボタンは縮小しない */
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.05);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #94a3b8;
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.3);
`;

const DragInstructions = styled.div`
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 0.875rem;
  text-align: center;
`;

export const SensorAssignmentModal: React.FC<SensorAssignmentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userProfiles, connectedSensors, savedSensors, actions } = useAppStore();
  const [draggedSensor, setDraggedSensor] = useState<string | null>(null);
  const [dragOverUser, setDragOverUser] = useState<string | null>(null);

  const activeUsers = Object.values(userProfiles).filter(user => user.isActive);
  const allSensors = Object.values(savedSensors);
  const connectedSensorsList = Object.values(connectedSensors);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAssignedUser = (sensorId: string) => {
    const assignedUserId = savedSensors[sensorId]?.assignedUserId;
    return assignedUserId ? userProfiles[assignedUserId] : null;
  };

  const isConnected = (sensorId: string) => {
    return !!connectedSensors[sensorId];
  };

  // ★ シンプルなライブデータ取得 - null/undefined チェックを修正
  const getSensorLiveValue = (sensorId: string): string => {
    const sensor = connectedSensors[sensorId];
    if (!sensor || !sensor.data) return '--';

    switch (sensor.type) {
      case 'CyclingPower':
        return sensor.data.power !== null ? `${sensor.data.power}W` : '--';
      case 'HeartRate':
        return sensor.data.value !== null ? `${sensor.data.value}bpm` : '--';
      case 'CyclingSpeedCadence':
        return sensor.data.value !== null ? `${sensor.data.value}rpm` : '--';
      case 'CoreBodyTemperature':
        return sensor.data.coreTemperature != null ? `${sensor.data.coreTemperature.toFixed(1)}°C` : '--';
      case 'MuscleoxygenSensor':
        return sensor.data.smo2 != null ? `${sensor.data.smo2.toFixed(1)}%` : '--';
      default:
        return '--';
    }
  };

  const handleDragStart = (e: React.DragEvent, sensorId: string) => {
    setDraggedSensor(sensorId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sensorId);
  };

  const handleDragEnd = () => {
    setDraggedSensor(null);
    setDragOverUser(null);
  };

  const handleDragOver = (e: React.DragEvent, userId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverUser(userId);
  };

  const handleDragLeave = () => {
    setDragOverUser(null);
  };

  const handleDrop = (e: React.DragEvent, userId: string) => {
    e.preventDefault();
    const sensorId = e.dataTransfer.getData('text/plain');
    
    if (sensorId && draggedSensor === sensorId) {
      actions.assignSensorToUser(sensorId, userId);
    }
    
    setDraggedSensor(null);
    setDragOverUser(null);
  };

  const handleUnassign = (sensorId: string) => {
    actions.unassignSensorFromUser(sensorId);
  };

  const getUserAssignedSensors = (userId: string) => {
    return allSensors.filter(sensor => sensor.assignedUserId === userId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sensor Assignment"
      size="large"
    >
      <Container>
        <DragInstructions>
          <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Drag sensors from the right to assign them to athletes on the left. Each sensor can only be assigned to one athlete at a time.
        </DragInstructions>

        <AssignmentGrid>
          <Column>
            <ColumnHeader>
              <User size={16} />
              Active Athletes ({activeUsers.length})
            </ColumnHeader>
            
            {activeUsers.length === 0 ? (
              <EmptyState>
                <p>No active athletes</p>
                <p>Activate athletes in Athlete Management first</p>
              </EmptyState>
            ) : (
              <ItemList>
                {activeUsers.map(user => {
                  const assignedSensors = getUserAssignedSensors(user.id);
                  return (
                    <UserItem
                      key={user.id}
                      $isActive={user.isActive}
                      $isDragOver={dragOverUser === user.id}
                      onDragOver={(e) => handleDragOver(e, user.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, user.id)}
                    >
                      <UserAvatar $color={user.color}>
                        {getUserInitials(user.name)}
                      </UserAvatar>
                      <UserInfo>
                        <UserName>{user.name}</UserName>
                        <UserStats>
                          FTP: {user.ftp}W • {assignedSensors.length} sensors assigned
                        </UserStats>
                      </UserInfo>
                    </UserItem>
                  );
                })}
              </ItemList>
            )}
          </Column>

          <Column>
            <ColumnHeader>
              <Bluetooth size={16} />
              Sensors ({allSensors.length})
            </ColumnHeader>
            
            {allSensors.length === 0 ? (
              <EmptyState>
                <p>No sensors found</p>
                <p>Connect sensors first to assign them</p>
              </EmptyState>
            ) : (
              <ItemList>
                {allSensors.map(sensor => {
                  const assignedUser = getAssignedUser(sensor.id);
                  const connected = isConnected(sensor.id);
                  const liveValue = connected ? getSensorLiveValue(sensor.id) : null;
                  
                  return (
                    <SensorItem
                      key={sensor.id}
                      $isConnected={connected}
                      $isDragging={draggedSensor === sensor.id}
                      $assignedUserId={sensor.assignedUserId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sensor.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <SensorIcon $isConnected={connected}>
                        {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                      </SensorIcon>
                      <SensorInfo>
                        <SensorName>
                          {sensor.userAlias || sensor.name || 'Unknown Device'}
                        </SensorName>
                        <SensorType>
                          {ValueFormatter.formatSensorTypeName(sensor.type)}
                          {connected && ' • Connected'}
                          {/* ★ シンプルなライブデータ表示 */}
                          {connected && liveValue && (
                            <LiveData>{liveValue}</LiveData>
                          )}
                        </SensorType>
                      </SensorInfo>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {assignedUser ? (
                          <>
                            <AssignmentBadge $userColor={assignedUser.color}>
                              <Link size={12} />
                              {assignedUser.name}
                            </AssignmentBadge>
                            <UnassignButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassign(sensor.id);
                              }}
                              title="Unassign sensor"
                            >
                              <Unlink size={12} />
                            </UnassignButton>
                          </>
                        ) : (
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            Unassigned
                          </div>
                        )}
                      </div>
                    </SensorItem>
                  );
                })}
              </ItemList>
            )}
          </Column>
        </AssignmentGrid>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Container>
    </Modal>
  );
};
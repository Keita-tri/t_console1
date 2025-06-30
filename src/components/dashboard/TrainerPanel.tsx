import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import { trainerService } from '../../services/trainerService';
import { PanelLayout, ConnectedTrainer } from '../../types';
import { Power, Settings, Zap, Square, Bluetooth, Wifi, WifiOff, AlertCircle, CheckCircle, Loader, Mountain, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrainerPanelProps {
  panel: PanelLayout;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.4);
  }
  
  transition: all 200ms ease;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(15, 15, 35, 0.8);
  flex-shrink: 0;
  gap: 8px;
`;

const PanelTitle = styled.h3`
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 500;
  color: #94a3b8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin-right: 8px;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
  min-width: 0;
  opacity: 0.8;
`;

const StatusIndicator = styled.div<{ $connected: boolean; $connecting?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: clamp(0.6rem, 0.9vw, 0.7rem);
  color: ${({ $connected, $connecting }) => 
    $connecting ? '#f59e0b' : 
    $connected ? '#10b981' : '#94a3b8'
  };
  padding: 4px 8px;
  background: ${({ $connected, $connecting }) => 
    $connecting ? 'rgba(245, 158, 11, 0.1)' : 
    $connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)'
  };
  border: 1px solid ${({ $connected, $connecting }) => 
    $connecting ? 'rgba(245, 158, 11, 0.3)' : 
    $connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)'
  };
  border-radius: 4px;
  flex-shrink: 0;
`;

const StatusDot = styled.div<{ $connected: boolean; $connecting?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $connected, $connecting }) => 
    $connecting ? '#f59e0b' : 
    $connected ? '#10b981' : '#94a3b8'
  };
  ${({ $connected, $connecting }) => ($connected || $connecting) && `
    animation: pulse 2s infinite;
  `}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
`;

const PanelBody = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 12px;
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 6px 4px;
  border: 1px solid ${({ active }) => active ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.2)'};
  background: ${({ active }) => active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)'};
  color: ${({ active }) => active ? '#e2e8f0' : '#94a3b8'};
  border-radius: 6px;
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  letter-spacing: 0.025em;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    background: ${({ active }) => active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'};
    color: #e2e8f0;
  }
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ValueDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const ValueLabel = styled.span`
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  opacity: 0.8;
`;

const ValueNumber = styled.span`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.3);
`;

const ValueUnit = styled.span`
  font-size: clamp(0.8rem, 1.3vw, 1rem);
  color: #94a3b8;
  margin-left: 4px;
  font-weight: 500;
  letter-spacing: 0.025em;
`;

const AdjustmentControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AdjustButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.1);
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
  }
`;

const NumberInput = styled.input`
  width: 60px;
  padding: 4px 6px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  font-size: clamp(0.7rem, 1.1vw, 0.75rem);
  font-weight: 600;
  text-align: center;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const ConnectionSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 12px;
`;

const ConnectionMessage = styled.p`
  color: #94a3b8;
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 6px 8px;
  border-radius: 4px;
  font-size: clamp(0.6rem, 0.9vw, 0.7rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ type }) => 
    type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
    type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(59, 130, 246, 0.1)'
  };
  border: 1px solid ${({ type }) => 
    type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
    type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
    'rgba(59, 130, 246, 0.3)'
  };
  color: ${({ type }) => 
    type === 'success' ? '#10b981' : 
    type === 'error' ? '#ef4444' : 
    '#3b82f6'
  };
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
`;

export const TrainerPanel: React.FC<TrainerPanelProps> = ({ panel }) => {
  const { connectedTrainers, actions } = useAppStore();
  const [targetPower, setTargetPower] = useState(150);
  const [resistanceLevel, setResistanceLevel] = useState(5);
  const [gradeLevel, setGradeLevel] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'erg' | 'resistance' | 'simulation'>('erg');
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Get the specific trainer for this panel
  const trainerId = panel.source?.sensorId;
  const trainer = trainerId ? connectedTrainers[trainerId] : null;
  const isConnected = trainer?.status.connectionState === 'connected';

  // Initialize trainer service callbacks
  useEffect(() => {
    trainerService.setStatusCallback((trainerId: string, status: any) => {
      actions.updateTrainerStatus(trainerId, status);
    });

    trainerService.setDataCallback((trainerId: string, data: Record<string, number>) => {
      actions.updateSensorData(trainerId, data);
    });
  }, [actions]);

  // Update status message based on trainer status
  useEffect(() => {
    if (trainer?.status.lastResponse) {
      const isError = trainer.status.lastResponse.includes('failed') || 
                     trainer.status.lastResponse.includes('error');
      setStatusMessage({
        text: trainer.status.lastResponse,
        type: isError ? 'error' : 'success'
      });
      
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [trainer?.status.lastResponse]);

  // Update panel display name when trainer is connected
  useEffect(() => {
    if (trainer && trainer.name && panel.displayName !== trainer.name) {
      actions.updatePanel(panel.i, {
        ...panel,
        displayName: trainer.name
      });
    }
  }, [trainer?.name, panel, actions]);

  const handleConnectTrainer = async () => {
    setIsConnecting(true);
    setStatusMessage({ text: 'Scanning for trainers...', type: 'info' });
    
    try {
      const devices = await trainerService.scanForTrainers();
      if (devices.length > 0) {
        setStatusMessage({ text: 'Connecting to trainer...', type: 'info' });
        const newTrainer = await trainerService.connectTrainer(devices[0]);
        actions.addTrainer(newTrainer);
        
        // Update panel to use this trainer and set the display name
        actions.updatePanel(panel.i, {
          ...panel,
          source: {
            sensorId: newTrainer.id,
            dataKey: 'control'
          },
          displayName: newTrainer.name || 'Smart Trainer'
        });
        
        setStatusMessage({ text: 'Trainer connected successfully!', type: 'success' });
        toast.success(`${newTrainer.name || 'Trainer'} connected`);
      }
    } catch (error) {
      console.error('Trainer connection error:', error);
      setStatusMessage({ text: 'Failed to connect trainer', type: 'error' });
      toast.error('Failed to connect trainer');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectTrainer = async () => {
    if (trainer) {
      try {
        await trainerService.disconnectTrainer(trainer.id);
        actions.removeTrainer(trainer.id);
        
        // Clear panel source and reset display name
        actions.updatePanel(panel.i, {
          ...panel,
          source: undefined,
          displayName: 'Trainer Control'
        });
        
        setStatusMessage({ text: 'Trainer disconnected', type: 'info' });
        toast.success('Trainer disconnected');
      } catch (error) {
        console.error('Trainer disconnection error:', error);
        setStatusMessage({ text: 'Failed to disconnect trainer', type: 'error' });
      }
    }
  };

  const handleSendCommand = async (commandType: 'setPower' | 'setResistance' | 'setSlope') => {
    if (!trainer) return;

    try {
      let value: number;
      let successMessage: string;

      switch (commandType) {
        case 'setPower':
          value = targetPower;
          successMessage = `Target power set to ${value}W`;
          break;
        case 'setResistance':
          value = resistanceLevel;
          successMessage = `Resistance set to level ${value}`;
          break;
        case 'setSlope':
          value = gradeLevel;
          successMessage = `Grade set to ${value}%`;
          break;
      }

      await trainerService.sendCommand(trainer.id, {
        type: commandType,
        value
      });

      setStatusMessage({ text: successMessage, type: 'success' });
      toast.success(successMessage);
    } catch (error) {
      console.error('Command error:', error);
      setStatusMessage({ text: 'Failed to send command', type: 'error' });
      toast.error('Failed to send command');
    }
  };

  const handleStop = async () => {
    if (trainer) {
      try {
        await trainerService.sendCommand(trainer.id, { type: 'stop' });
        setStatusMessage({ text: 'Trainer stopped', type: 'success' });
        toast.success('Trainer stopped');
      } catch (error) {
        console.error('Stop error:', error);
        setStatusMessage({ text: 'Failed to stop trainer', type: 'error' });
        toast.error('Failed to stop trainer');
      }
    }
  };

  const adjustValue = (type: 'power' | 'resistance' | 'grade', delta: number) => {
    switch (type) {
      case 'power':
        setTargetPower(prev => Math.max(50, Math.min(500, prev + delta)));
        break;
      case 'resistance':
        setResistanceLevel(prev => Math.max(0, Math.min(20, prev + delta)));
        break;
      case 'grade':
        setGradeLevel(prev => Math.max(-10, Math.min(20, prev + delta)));
        break;
    }
  };

  const getDisplayTitle = () => {
    // Use the panel's display name if set, otherwise fall back to trainer name or default
    if (panel.displayName && panel.displayName !== 'Trainer Control') {
      return panel.displayName;
    }
    
    if (trainer?.name) {
      return trainer.name;
    }
    
    return panel.displayName || 'Trainer Control';
  };

  if (!isConnected) {
    return (
      <PanelContainer>
        <PanelHeader>
          <PanelTitle>
            <Zap size={14} />
            {getDisplayTitle()}
          </PanelTitle>
          <StatusIndicator $connected={false} $connecting={isConnecting}>
            <StatusDot $connected={false} $connecting={isConnecting} />
            {isConnecting ? <Loader size={10} className="loading-icon" /> : <WifiOff size={10} />}
          </StatusIndicator>
        </PanelHeader>

        <PanelBody>
          {statusMessage && (
            <StatusMessage type={statusMessage.type}>
              {statusMessage.type === 'success' && <CheckCircle size={12} />}
              {statusMessage.type === 'error' && <AlertCircle size={12} />}
              {statusMessage.type === 'info' && <Loader size={12} className="loading-icon" />}
              {statusMessage.text}
            </StatusMessage>
          )}

          <ConnectionSection>
            <ConnectionMessage>
              Connect a smart trainer to control resistance and power targets.
            </ConnectionMessage>
            <Button
              variant="primary"
              size="small"
              onClick={handleConnectTrainer}
              disabled={isConnecting}
              icon={isConnecting ? <Loader className="loading-icon" size={14} /> : <Bluetooth size={14} />}
            >
              {isConnecting ? 'Scanning...' : 'Connect'}
            </Button>
          </ConnectionSection>
        </PanelBody>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <Zap size={14} />
          {getDisplayTitle()}
        </PanelTitle>
        <StatusIndicator $connected={true}>
          <StatusDot $connected={true} />
          <Wifi size={10} />
        </StatusIndicator>
      </PanelHeader>

      <PanelBody>
        {statusMessage && (
          <StatusMessage type={statusMessage.type}>
            {statusMessage.type === 'success' && <CheckCircle size={12} />}
            {statusMessage.type === 'error' && <AlertCircle size={12} />}
            {statusMessage.type === 'info' && <Loader size={12} className="loading-icon" />}
            {statusMessage.text}
          </StatusMessage>
        )}

        <ModeSelector>
          <ModeButton
            active={selectedMode === 'erg'}
            onClick={() => setSelectedMode('erg')}
          >
            ERG
          </ModeButton>
          <ModeButton
            active={selectedMode === 'resistance'}
            onClick={() => setSelectedMode('resistance')}
          >
            Resistance
          </ModeButton>
          <ModeButton
            active={selectedMode === 'simulation'}
            onClick={() => setSelectedMode('simulation')}
          >
            Simulation
          </ModeButton>
        </ModeSelector>

        {selectedMode === 'erg' && (
          <ControlSection>
            <ValueDisplay>
              <ValueLabel>Target Power</ValueLabel>
              <AdjustmentControls>
                <AdjustButton onClick={() => adjustValue('power', -10)}>
                  <Minus size={12} />
                </AdjustButton>
                <NumberInput
                  type="number"
                  min="50"
                  max="500"
                  value={targetPower}
                  onChange={(e) => setTargetPower(parseInt(e.target.value) || 50)}
                />
                <AdjustButton onClick={() => adjustValue('power', 10)}>
                  <Plus size={12} />
                </AdjustButton>
                <ValueUnit>W</ValueUnit>
              </AdjustmentControls>
            </ValueDisplay>
            
            {trainer.status.currentPower !== null && (
              <ValueDisplay>
                <ValueLabel>Current Power</ValueLabel>
                <div>
                  <ValueNumber>{trainer.status.currentPower}</ValueNumber>
                  <ValueUnit>W</ValueUnit>
                </div>
              </ValueDisplay>
            )}
            
            <ActionButtons>
              <Button
                variant="primary"
                size="small"
                onClick={() => handleSendCommand('setPower')}
                icon={<Power size={12} />}
              >
                Set Power
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleStop}
                icon={<Square size={12} />}
              >
                Stop
              </Button>
            </ActionButtons>
          </ControlSection>
        )}

        {selectedMode === 'resistance' && (
          <ControlSection>
            <ValueDisplay>
              <ValueLabel>Resistance Level</ValueLabel>
              <AdjustmentControls>
                <AdjustButton onClick={() => adjustValue('resistance', -1)}>
                  <Minus size={12} />
                </AdjustButton>
                <NumberInput
                  type="number"
                  min="0"
                  max="20"
                  value={resistanceLevel}
                  onChange={(e) => setResistanceLevel(parseInt(e.target.value) || 0)}
                />
                <AdjustButton onClick={() => adjustValue('resistance', 1)}>
                  <Plus size={12} />
                </AdjustButton>
              </AdjustmentControls>
            </ValueDisplay>
            
            <ActionButtons>
              <Button
                variant="primary"
                size="small"
                onClick={() => handleSendCommand('setResistance')}
                icon={<Settings size={12} />}
              >
                Set Resistance
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleStop}
                icon={<Square size={12} />}
              >
                Stop
              </Button>
            </ActionButtons>
          </ControlSection>
        )}

        {selectedMode === 'simulation' && (
          <ControlSection>
            <ValueDisplay>
              <ValueLabel>Grade</ValueLabel>
              <AdjustmentControls>
                <AdjustButton onClick={() => adjustValue('grade', -0.5)}>
                  <Minus size={12} />
                </AdjustButton>
                <NumberInput
                  type="number"
                  min="-10"
                  max="20"
                  step="0.5"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(parseFloat(e.target.value) || 0)}
                />
                <AdjustButton onClick={() => adjustValue('grade', 0.5)}>
                  <Plus size={12} />
                </AdjustButton>
                <ValueUnit>%</ValueUnit>
              </AdjustmentControls>
            </ValueDisplay>
            
            <ActionButtons>
              <Button
                variant="primary"
                size="small"
                onClick={() => handleSendCommand('setSlope')}
                icon={<Mountain size={12} />}
              >
                Set Grade
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleStop}
                icon={<Square size={12} />}
              >
                Stop
              </Button>
            </ActionButtons>
          </ControlSection>
        )}

        <ActionButtons>
          <Button
            variant="secondary"
            size="small"
            onClick={handleDisconnectTrainer}
          >
            Disconnect
          </Button>
        </ActionButtons>
      </PanelBody>
    </PanelContainer>
  );
};
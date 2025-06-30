import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ColorPicker } from '../common/ColorPicker';
import { PanelLayout, DataType, PanelType } from '../../types';
import { DATA_TYPE_CONFIGS, DATA_TYPE_CATEGORIES, DATA_TYPE_SUBCATEGORIES } from '../../constants/dataTypes';
import { useAppStore } from '../../store/useAppStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PanelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  panel?: PanelLayout;
  onSave: (panel: PanelLayout) => void;
  onDelete?: (panelId: string) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormSelect = styled.select`
  padding: 8px 10px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  transition: all 200ms ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  option {
    background: rgba(30, 41, 59, 0.95);
    color: #e2e8f0;
  }
  
  optgroup {
    background: rgba(15, 15, 35, 0.95);
    color: #94a3b8;
    font-weight: 600;
  }
`;

const FormInput = styled.input`
  padding: 8px 10px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  transition: all 200ms ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
`;

const AdvancedSettings = styled.div<{ $isOpen: boolean }>`
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: all 200ms ease;
  background: rgba(15, 15, 35, 0.5);
`;

const AdvancedHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 15, 35, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  transition: background-color 200ms ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const AdvancedContent = styled.div<{ $isOpen: boolean }>`
  padding: ${({ $isOpen }) => $isOpen ? '16px' : '0 16px'};
  max-height: ${({ $isOpen }) => $isOpen ? '400px' : '0'};
  overflow: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 200ms ease;
  background: rgba(30, 41, 59, 0.3);
`;

const DataSourceSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const DataSourceTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
`;

const SensorInfo = styled.div`
  padding: 12px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-top: 8px;
`;

const SensorInfoText = styled.p`
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

const CompatibleSensorsList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SensorTag = styled.span<{ $isConnected: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $isConnected }) => $isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
  color: ${({ $isConnected }) => $isConnected ? '#10b981' : '#94a3b8'};
  border: 1px solid ${({ $isConnected }) => $isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
`;

export const PanelEditModal: React.FC<PanelEditModalProps> = ({
  isOpen,
  onClose,
  panel,
  onSave,
  onDelete
}) => {
  const { connectedSensors, connectedTrainers } = useAppStore();
  const [formData, setFormData] = useState<Partial<PanelLayout>>({
    panelType: 'data',
    dataType: 'power',
    displayName: '',
    config: {
      timeWindow: 5,
      showUnit: true,
      precision: 0,
      color: '#ffffff'
    }
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!panel;
  const sensorList = Object.values(connectedSensors);
  const trainerList = Object.values(connectedTrainers);

  useEffect(() => {
    if (panel) {
      setFormData({
        ...panel,
        config: {
          timeWindow: 5,
          showUnit: true,
          precision: 0,
          color: '#ffffff',
          ...panel.config
        }
      });
    } else {
      setFormData({
        panelType: 'data',
        dataType: 'power',
        displayName: '',
        config: {
          timeWindow: 5,
          showUnit: true,
          precision: 0,
          color: '#ffffff'
        }
      });
    }
    setShowAdvanced(false);
  }, [panel, isOpen]);

  const handleSave = () => {
    const dataTypeConfig = DATA_TYPE_CONFIGS[formData.dataType!];
    
    let source = formData.source;
    
    // For trainer panels, ensure we have a trainer source
    if (formData.panelType === 'trainer') {
      if (!source && trainerList.length > 0) {
        source = {
          sensorId: trainerList[0].id,
          dataKey: 'control'
        };
      }
    } else if (dataTypeConfig?.requiresSensor && !source) {
      const compatibleSensor = sensorList.find(sensor => 
        dataTypeConfig.supportedSensorTypes?.includes(sensor.type)
      );
      if (compatibleSensor) {
        source = {
          sensorId: compatibleSensor.id,
          dataKey: 'value'
        };
      }
    }

    const newPanel: PanelLayout = {
      i: panel?.i || `panel-${Date.now()}`,
      x: panel?.x || 0,
      y: panel?.y || 0,
      w: panel?.w || (formData.panelType === 'trainer' ? 4 : 2),
      h: panel?.h || (formData.panelType === 'trainer' ? 4 : 2),
      panelType: formData.panelType!,
      dataType: formData.dataType!,
      source,
      displayName: formData.displayName || (formData.panelType === 'trainer' ? 'Trainer Control' : dataTypeConfig?.label),
      config: formData.config
    };

    onSave(newPanel);
    onClose();
  };

  const handleDelete = () => {
    if (panel && onDelete) {
      onDelete(panel.i);
      onClose();
    }
  };

  const selectedDataTypeConfig = DATA_TYPE_CONFIGS[formData.dataType!];
  const needsSensor = selectedDataTypeConfig?.requiresSensor;
  const isCalculatedData = selectedDataTypeConfig?.subcategory === 'calculated';
  
  const getCompatibleSensorsForCalculated = () => {
    const dataType = formData.dataType!;
    
    if (dataType.includes('power') || dataType.includes('Power')) {
      return sensorList.filter(sensor => sensor.type === 'CyclingPower');
    } else if (dataType.includes('heartRate') || dataType.includes('HeartRate')) {
      return sensorList.filter(sensor => sensor.type === 'HeartRate');
    } else if (dataType.includes('cadence') || dataType.includes('Cadence')) {
      return sensorList.filter(sensor => 
        sensor.type === 'CyclingPower' || sensor.type === 'CyclingSpeedCadence'
      );
    }
    
    return [];
  };

  const compatibleSensors = needsSensor 
    ? sensorList.filter(sensor => 
        selectedDataTypeConfig.supportedSensorTypes?.includes(sensor.type)
      )
    : isCalculatedData 
    ? getCompatibleSensorsForCalculated()
    : [];

  const groupedDataTypes = Object.entries(DATA_TYPE_CONFIGS).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = {};
    }
    if (!acc[config.category][config.subcategory || 'default']) {
      acc[config.category][config.subcategory || 'default'] = [];
    }
    acc[config.category][config.subcategory || 'default'].push({ key, config });
    return acc;
  }, {} as Record<string, Record<string, Array<{ key: string; config: typeof DATA_TYPE_CONFIGS[string] }>>>);

  const getSensorTypeName = (sensorType: string) => {
    switch (sensorType) {
      case 'CyclingPower': return 'Power Meter';
      case 'CyclingSpeedCadence': return 'Speed & Cadence Sensor';
      case 'HeartRate': return 'Heart Rate Sensor';
      case 'CoreBodyTemperature': return 'Temperature Sensor';
      case 'MuscleoxygenSensor': return 'Muscle Oxygen Sensor';
      default: return sensorType;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Panel' : 'Add Panel'}
      size="medium"
    >
      <FormContainer>
        <FormRow>
          <FormGroup>
            <FormLabel>Panel Type</FormLabel>
            <FormSelect
              value={formData.panelType}
              onChange={(e) => setFormData({ ...formData, panelType: e.target.value as PanelType })}
            >
              <option value="data">Data Panel</option>
              <option value="graph">Graph Panel</option>
              <option value="trainer">Trainer Control</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Display Name</FormLabel>
            <FormInput
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder={
                formData.panelType === 'trainer' 
                  ? 'Trainer Control' 
                  : selectedDataTypeConfig?.label || 'Custom display name'
              }
            />
          </FormGroup>
        </FormRow>

        {formData.panelType !== 'trainer' && (
          <FormGroup>
            <FormLabel>Data Type</FormLabel>
            <FormSelect
              value={formData.dataType}
              onChange={(e) => setFormData({ 
                ...formData, 
                dataType: e.target.value as DataType,
                source: undefined
              })}
            >
              {Object.entries(groupedDataTypes).map(([category, subcategories]) => (
                <optgroup key={category} label={DATA_TYPE_CATEGORIES[category as keyof typeof DATA_TYPE_CATEGORIES]}>
                  {Object.entries(subcategories).map(([subcategory, items]) => (
                    <React.Fragment key={subcategory}>
                      {subcategory !== 'default' && items.length > 0 && (
                        <option disabled style={{ fontWeight: 'bold', color: '#94a3b8' }}>
                          ── {DATA_TYPE_SUBCATEGORIES[subcategory as keyof typeof DATA_TYPE_SUBCATEGORIES] || subcategory} ──
                        </option>
                      )}
                      {items.map(({ key, config }) => (
                        <option key={key} value={key}>
                          {config.label} {config.unit && `(${config.unit})`}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </optgroup>
              ))}
            </FormSelect>
          </FormGroup>
        )}

        {formData.panelType === 'trainer' && (
          <DataSourceSection>
            <DataSourceTitle>Trainer Selection</DataSourceTitle>
            {trainerList.length > 0 ? (
              <>
                <FormGroup>
                  <FormLabel>Select Trainer</FormLabel>
                  <FormSelect
                    value={formData.source?.sensorId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      source: e.target.value ? {
                        sensorId: e.target.value,
                        dataKey: 'control'
                      } : undefined
                    })}
                  >
                    <option value="">Select a trainer</option>
                    {trainerList.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name || trainer.id} (Smart Trainer)
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <SensorInfo>
                  <SensorInfoText>
                    Connected trainers found. Select one to control.
                  </SensorInfoText>
                </SensorInfo>
              </>
            ) : (
              <SensorInfo>
                <SensorInfoText>
                  No trainers connected. Connect a smart trainer first to use this panel.
                </SensorInfoText>
              </SensorInfo>
            )}
          </DataSourceSection>
        )}

        {formData.panelType !== 'trainer' && (needsSensor || isCalculatedData) && (
          <DataSourceSection>
            <DataSourceTitle>Data Source</DataSourceTitle>

            <FormGroup>
              <FormLabel>Sensor Selection</FormLabel>
              {compatibleSensors.length > 0 ? (
                <>
                  <FormSelect
                    value={formData.source?.sensorId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      source: e.target.value ? {
                        sensorId: e.target.value,
                        dataKey: 'value'
                      } : undefined
                    })}
                  >
                    <option value="">Select a sensor</option>
                    {compatibleSensors.map(sensor => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.name || sensor.id} ({getSensorTypeName(sensor.type)})
                      </option>
                    ))}
                  </FormSelect>
                  <SensorInfo>
                    <SensorInfoText>
                      Compatible connected sensors found.
                    </SensorInfoText>
                    <CompatibleSensorsList>
                      {compatibleSensors.map(sensor => (
                        <SensorTag key={sensor.id} $isConnected={true}>
                          {getSensorTypeName(sensor.type)}
                        </SensorTag>
                      ))}
                    </CompatibleSensorsList>
                  </SensorInfo>
                </>
              ) : (
                <SensorInfo>
                  <SensorInfoText>
                    No compatible sensors connected for this data type.
                  </SensorInfoText>
                  <SensorInfoText style={{ marginTop: '8px', fontWeight: '500' }}>
                    Compatible sensors:
                  </SensorInfoText>
                  <CompatibleSensorsList>
                    {selectedDataTypeConfig.supportedSensorTypes?.map(sensorType => (
                      <SensorTag key={sensorType} $isConnected={false}>
                        {getSensorTypeName(sensorType)}
                      </SensorTag>
                    ))}
                  </CompatibleSensorsList>
                </SensorInfo>
              )}
            </FormGroup>
          </DataSourceSection>
        )}

        {formData.panelType !== 'trainer' && (
          <AdvancedSettings $isOpen={showAdvanced}>
            <AdvancedHeader onClick={() => setShowAdvanced(!showAdvanced)}>
              Advanced Settings
              {showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </AdvancedHeader>
            <AdvancedContent $isOpen={showAdvanced}>
              <FormContainer>
                {formData.panelType === 'graph' && (
                  <FormGroup>
                    <FormLabel>Time Window</FormLabel>
                    <FormSelect
                      value={formData.config?.timeWindow || 5}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          timeWindow: parseInt(e.target.value)
                        }
                      })}
                    >
                      <option value={1}>1 minute</option>
                      <option value={2}>2 minutes</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                    </FormSelect>
                  </FormGroup>
                )}

                <FormRow>
                  <FormGroup>
                    <FormLabel>Decimal Places</FormLabel>
                    <FormSelect
                      value={formData.config?.precision || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          precision: parseInt(e.target.value)
                        }
                      })}
                    >
                      <option value={0}>Integer</option>
                      <option value={1}>1 decimal place</option>
                      <option value={2}>2 decimal places</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <ColorPicker
                      label="Panel Color"
                      value={formData.config?.color || '#ffffff'}
                      onChange={(color) => setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          color
                        }
                      })}
                      dataType={formData.dataType}
                    />
                  </FormGroup>
                </FormRow>
              </FormContainer>
            </AdvancedContent>
          </AdvancedSettings>
        )}

        <ButtonGroup>
          {isEditing && onDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </ButtonGroup>
      </FormContainer>
    </Modal>
  );
};
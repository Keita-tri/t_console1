import { StateCreator } from 'zustand';
import { ConnectedSensor, ConnectedTrainer, SavedSensorInfo, TrainerState, TrainerCommand, SensorSessionData } from '../../types';
import { cadenceCalculatorManager } from '../../utils/cadenceCalculator';
import { CalculationEngine } from '../../utils/calculationUtils';
import { SensorDataCalculator } from '../../utils/dataCalculations';

export interface DeviceSlice {
  // State
  connectedSensors: Record<string, ConnectedSensor>;
  connectedTrainers: Record<string, ConnectedTrainer>;
  savedSensors: Record<string, SavedSensorInfo>;
  sensorSessionData: Record<string, SensorSessionData>;
  trainerState: TrainerState;

  // Actions
  deviceActions: {
    // Sensor management
    addSensor: (sensor: ConnectedSensor) => void;
    removeSensor: (id: string) => void;
    updateSensorData: (id: string, data: Record<string, number>) => void;
    
    // Saved sensor management
    saveSensorInfo: (sensor: ConnectedSensor) => void;
    removeSavedSensor: (id: string) => void;
    updateSensorAlias: (id: string, alias: string) => void;
    getSavedSensors: () => SavedSensorInfo[];
    
    // Sensor assignment
    assignSensorToUser: (sensorId: string, userId: string) => void;
    unassignSensorFromUser: (sensorId: string) => void;
    getSensorAssignedUser: (sensorId: string) => string | null;
    getUserAssignedSensors: (userId: string) => string[];
    
    // Sensor data retrieval
    getSensorData: (sensorId: string, dataType: string) => (number | null)[];
    getSensorTimestamps: (sensorId: string) => number[];
    getSensorStats: (sensorId: string, dataType: string, statType: 'max' | 'min' | 'avg') => number | null;
    getSensorLapStats: (sensorId: string, dataType: string, statType: 'max' | 'min' | 'avg') => number | null;
    
    // ★ 新しいアクション: センサーセッションデータのクリア
    clearSensorSessionData: () => void;
    
    // Trainer management
    addTrainer: (trainer: ConnectedTrainer) => void;
    removeTrainer: (id: string) => void;
    updateTrainerStatus: (id: string, status: Partial<ConnectedTrainer['status']>) => void;
    updateTrainerState: (updates: Partial<TrainerState>) => void;
    assignTrainerToUser: (trainerId: string, userId: string) => void;
    sendTrainerCommand: (id: string, command: TrainerCommand) => void;
  };
}

export const createDeviceSlice: StateCreator<
  DeviceSlice,
  [],
  [],
  DeviceSlice
> = (set, get) => ({
  // Initial state
  connectedSensors: {},
  connectedTrainers: {},
  savedSensors: {},
  sensorSessionData: {},
  trainerState: {
    connectionState: 'disconnected',
    deviceName: '',
    trainerStatusMessage: '---',
    activeMode: 'erg',
    targetValues: {
      power: 100,
      resistance: 0,
      grade: 0,
    },
    lastSuccessfulValues: {
      resistance: 0,
    }
  },

  deviceActions: {
    // Sensor management
    addSensor: (sensor: ConnectedSensor) => {
      set((state) => {
        const savedSensorInfo: SavedSensorInfo = {
          id: sensor.id,
          name: sensor.name,
          type: sensor.type,
          lastConnected: Date.now(),
          userAlias: state.savedSensors[sensor.id]?.userAlias,
          assignedUserId: state.savedSensors[sensor.id]?.assignedUserId,
          assignmentHistory: state.savedSensors[sensor.id]?.assignmentHistory || []
        };

        const sensorWithAssignment = {
          ...sensor,
          assignedUserId: savedSensorInfo.assignedUserId
        };

        return {
          connectedSensors: {
            ...state.connectedSensors,
            [sensor.id]: sensorWithAssignment
          },
          savedSensors: {
            ...state.savedSensors,
            [sensor.id]: savedSensorInfo
          }
        };
      });
    },

    removeSensor: (id: string) => {
      set((state) => {
        const { [id]: removed, ...rest } = state.connectedSensors;
        const { [id]: removedData, ...restData } = state.sensorSessionData;
        
        cadenceCalculatorManager.removeCalculator(id);
        
        return { 
          connectedSensors: rest,
          sensorSessionData: restData
        };
      });
    },

    updateSensorData: (id: string, data: Record<string, number>) => {
      set((state) => {
        const sensor = state.connectedSensors[id];
        if (!sensor) {
          return state;
        }

        // 1. リアルタイム表示用のデータをイミュータブルに更新
        const updatedSensor = {
          ...sensor,
          data: { ...sensor.data, ...data }
        };

        const updatedConnectedSensors = {
          ...state.connectedSensors,
          [id]: updatedSensor,
        };

        // isRecordingがfalseの場合は、時系列データを更新せずに終了
        const appState = get() as any;
        if (!appState.isRecording) {
          return { connectedSensors: updatedConnectedSensors };
        }
        
        // ★ 修正: セッション開始前のデータは記録しない
        if (!appState.session.startTime) {
          console.log('Session not started, skipping data recording');
          return { connectedSensors: updatedConnectedSensors };
        }

        // 2. 時系列データをイミュータブルに更新
        const timestamp = Date.now();
        const oldSession = state.sensorSessionData[id] || {
          sensorId: id,
          sensorType: sensor.type,
          userId: sensor.assignedUserId,
          timestamps: [],
          data: {},
        };
        
        // ★ 修正: タイムスタンプがセッション開始時刻より前の場合はスキップ
        if (timestamp < appState.session.startTime) {
          console.log('Data timestamp before session start, skipping');
          return { connectedSensors: updatedConnectedSensors };
        }

        // 新しいタイムスタンプ配列を作成
        const newTimestamps = [...oldSession.timestamps, timestamp];
        const newSessionDataArrays: Record<string, (number | null)[]> = {};

        // 既存のデータキーと新しいデータキーをすべて集める
        const allKeys = new Set([
          ...Object.keys(oldSession.data),
          ...Object.keys(data),
        ]);

        allKeys.forEach((key) => {
          const oldArray = oldSession.data[key] || [];
          // 新しいデータが存在すればそれを、なければnullを追加
          const newValue = data.hasOwnProperty(key) ? data[key] : null;

          // 古い配列の長さがタイムスタンプの数より少ない場合、nullで埋める
          const paddedOldArray = [...oldArray];
          while (paddedOldArray.length < oldSession.timestamps.length) {
            paddedOldArray.push(null);
          }
          
          // 新しい配列を作成
          newSessionDataArrays[key] = [...paddedOldArray, newValue];
        });

        const newSensorSession = {
          ...oldSession,
          timestamps: newTimestamps,
          data: newSessionDataArrays,
        };

        return {
          connectedSensors: updatedConnectedSensors,
          sensorSessionData: {
            ...state.sensorSessionData,
            [id]: newSensorSession,
          },
        };
      });
    },

    // Saved sensor management
    saveSensorInfo: (sensor: ConnectedSensor) => {
      set((state) => {
        const savedSensorInfo: SavedSensorInfo = {
          id: sensor.id,
          name: sensor.name,
          type: sensor.type,
          lastConnected: Date.now(),
          userAlias: state.savedSensors[sensor.id]?.userAlias,
          assignedUserId: state.savedSensors[sensor.id]?.assignedUserId,
          assignmentHistory: state.savedSensors[sensor.id]?.assignmentHistory || []
        };

        return {
          savedSensors: {
            ...state.savedSensors,
            [sensor.id]: savedSensorInfo
          }
        };
      });
    },

    removeSavedSensor: (id: string) => {
      set((state) => {
        const { [id]: removed, ...rest } = state.savedSensors;
        return { savedSensors: rest };
      });
    },

    updateSensorAlias: (id: string, alias: string) => {
      set((state) => {
        const savedSensor = state.savedSensors[id];
        if (!savedSensor) return state;

        return {
          savedSensors: {
            ...state.savedSensors,
            [id]: {
              ...savedSensor,
              userAlias: alias
            }
          }
        };
      });
    },

    getSavedSensors: () => {
      const state = get();
      return Object.values(state.savedSensors).sort((a, b) => b.lastConnected - a.lastConnected);
    },

    // Sensor assignment
    assignSensorToUser: (sensorId: string, userId: string) => {
      set((state) => {
        const updatedSavedSensors = {
          ...state.savedSensors,
          [sensorId]: {
            ...state.savedSensors[sensorId],
            assignedUserId: userId,
            assignmentHistory: [
              ...(state.savedSensors[sensorId]?.assignmentHistory || []),
              {
                userId,
                assignedAt: Date.now()
              }
            ]
          }
        };

        const updatedConnectedSensors = {
          ...state.connectedSensors,
          [sensorId]: {
            ...state.connectedSensors[sensorId],
            assignedUserId: userId
          }
        };

        return {
          savedSensors: updatedSavedSensors,
          connectedSensors: updatedConnectedSensors
        };
      });
    },

    unassignSensorFromUser: (sensorId: string) => {
      set((state) => {
        const currentAssignment = state.savedSensors[sensorId]?.assignedUserId;
        
        const updatedSavedSensors = {
          ...state.savedSensors,
          [sensorId]: {
            ...state.savedSensors[sensorId],
            assignedUserId: undefined,
            assignmentHistory: currentAssignment ? [
              ...(state.savedSensors[sensorId]?.assignmentHistory || []),
              {
                userId: currentAssignment,
                assignedAt: state.savedSensors[sensorId]?.assignmentHistory?.slice(-1)[0]?.assignedAt || Date.now(),
                unassignedAt: Date.now()
              }
            ] : (state.savedSensors[sensorId]?.assignmentHistory || [])
          }
        };

        const updatedConnectedSensors = {
          ...state.connectedSensors,
          [sensorId]: {
            ...state.connectedSensors[sensorId],
            assignedUserId: undefined
          }
        };

        return {
          savedSensors: updatedSavedSensors,
          connectedSensors: updatedConnectedSensors
        };
      });
    },

    getSensorAssignedUser: (sensorId: string) => {
      const state = get();
      return state.savedSensors[sensorId]?.assignedUserId || null;
    },

    getUserAssignedSensors: (userId: string) => {
      const state = get();
      return Object.keys(state.savedSensors).filter(
        sensorId => state.savedSensors[sensorId].assignedUserId === userId
      );
    },

    // Sensor data retrieval (placeholder implementations)
    getSensorData: (sensorId: string, dataType: string) => {
      const state = get();
      const sensorData = state.sensorSessionData[sensorId];
      if (!sensorData) return [];
      
      const data = SensorDataCalculator.extractDataByType(sensorData, dataType);
      return data || [];
    },

    getSensorTimestamps: (sensorId: string) => {
      const state = get();
      return state.sensorSessionData[sensorId]?.timestamps || [];
    },

    getSensorStats: (sensorId: string, dataType: string, statType: 'max' | 'min' | 'avg') => {
      const state = get();
      const sensorData = state.sensorSessionData[sensorId];
      if (!sensorData) return null;

      const data = SensorDataCalculator.extractDataByType(sensorData, dataType);
      if (!data || data.length === 0) return null;

      switch (statType) {
        case 'max':
          return CalculationEngine.calculateMax(data);
        case 'min':
          return CalculationEngine.calculateMin(data);
        case 'avg':
          return CalculationEngine.calculateAverage(data);
        default:
          return null;
      }
    },

    getSensorLapStats: (sensorId: string, dataType: string, statType: 'max' | 'min' | 'avg') => {
      const state = get() as any;
      const sensorData = state.sensorSessionData[sensorId];
      const laps = state.session.laps;

      if (!sensorData || !laps || laps.length === 0) return null;

      const lastLap = laps[laps.length - 1];
      const lapStartTime = lastLap.startTime;
      const lapEndTime = lastLap.startTime + lastLap.duration;

      const lapIndices = sensorData.timestamps
        .map((t: number, i: number) => ({ t, i }))
        .filter((item: { t: number }) => item.t >= lapStartTime && item.t <= lapEndTime)
        .map((item: { i: number }) => item.i);
        
      if (lapIndices.length === 0) return null;

      const allData = SensorDataCalculator.extractDataByType(sensorData, dataType);
      const lapData = lapIndices.map((i: number) => allData[i]);

      switch (statType) {
        case 'max':
          return CalculationEngine.calculateMax(lapData);
        case 'min':
          return CalculationEngine.calculateMin(lapData);
        case 'avg':
          return CalculationEngine.calculateAverage(lapData);
        default:
          return null;
      }
    },

    // ★ 新しいアクション: センサーセッションデータのクリア
    clearSensorSessionData: () => {
      set(() => ({
        sensorSessionData: {}
      }));
    },

    // Trainer management
    addTrainer: (trainer: ConnectedTrainer) => {
      set((state) => ({
        connectedTrainers: {
          ...state.connectedTrainers,
          [trainer.id]: trainer
        },
        trainerState: {
          ...state.trainerState,
          connectionState: 'connected',
          deviceName: trainer.name || 'Smart Trainer'
        }
      }));
    },

    removeTrainer: (id: string) => {
      set((state) => {
        const { [id]: removed, ...rest } = state.connectedTrainers;
        return { 
          connectedTrainers: rest,
          trainerState: {
            ...state.trainerState,
            connectionState: 'disconnected',
            deviceName: '',
            trainerStatusMessage: '---'
          }
        };
      });
    },

    updateTrainerStatus: (id: string, status: Partial<ConnectedTrainer['status']>) => {
      set((state) => {
        const trainer = state.connectedTrainers[id];
        if (!trainer) return state;

        return {
          connectedTrainers: {
            ...state.connectedTrainers,
            [id]: {
              ...trainer,
              status: { ...trainer.status, ...status }
            }
          },
          trainerState: {
            ...state.trainerState,
            trainerStatusMessage: status.lastResponse || state.trainerState.trainerStatusMessage
          }
        };
      });
    },

    updateTrainerState: (updates: Partial<TrainerState>) => {
      set((state) => ({
        trainerState: {
          ...state.trainerState,
          ...updates
        }
      }));
    },

    assignTrainerToUser: (trainerId: string, userId: string) => {
      set((state) => ({
        connectedTrainers: {
          ...state.connectedTrainers,
          [trainerId]: {
            ...state.connectedTrainers[trainerId],
            assignedUserId: userId
          }
        }
      }));
    },

    sendTrainerCommand: (id: string, command: TrainerCommand) => {
      const state = get();
      const trainer = state.connectedTrainers[id];
      if (!trainer) return;

      // Command handling logic would go here
      switch (command.type) {
        case 'setPower':
          get().deviceActions.updateTrainerStatus(id, {
            targetPower: command.value || null,
            mode: 'ERG'
          });
          get().deviceActions.updateTrainerState({
            activeMode: 'erg',
            targetValues: {
              ...state.trainerState.targetValues,
              power: command.value || 100
            }
          });
          break;
        case 'setResistance':
          get().deviceActions.updateTrainerStatus(id, {
            mode: 'Resistance'
          });
          get().deviceActions.updateTrainerState({
            activeMode: 'resistance'
          });
          break;
        case 'stop':
          get().deviceActions.updateTrainerStatus(id, {
            targetPower: null,
            mode: 'Manual'
          });
          break;
      }
    }
  }
});
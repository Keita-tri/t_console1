import { StateCreator } from 'zustand';
import { Session, Lap, LegacySessionData, MultiUserSessionManager, UserSessionData } from '../../types';
import { cadenceCalculatorManager } from '../../utils/cadenceCalculator';
import { CSVExporter } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

export interface SessionSlice {
  // State
  session: Session;
  isRecording: boolean;
  multiUserSession: MultiUserSessionManager;
  sessionData: LegacySessionData;

  // Actions
  sessionActions: {
    // Session control
    startSession: () => void;
    stopSession: () => void;
    pauseSession: () => void;
    addLap: (userId?: string) => void;
    updateElapsedTime?: (deltaTime: number) => void;
    
    // Data recording
    recordSensorData: (data: { power?: number; heartRate?: number; cadence?: number }) => void;
    clearSessionData: () => void;
    clearAllSessionData: () => void; // 新しいアクション
    
    // Export functionality
    exportSessionData: () => void;
    hasExportableData: () => boolean;
    getExportStats: () => { sensorCount: number; dataPointCount: number; timeSpan: string };
    
    // Multi-user data retrieval
    getUserData: (userId: string, dataType: string) => (number | null)[];
    getUserTimestamps: (userId: string) => number[];
    getUserStats: (userId: string, dataType: string, statType: 'max' | 'min' | 'avg') => number | null;
    getUserLapStats: (userId: string, dataType: string, statType: 'max' | 'min' | 'avg') => number | null;
    getUserSessionStats: (userId: string) => any;
    
    // Statistics
    getSessionStats: () => any;
    getCurrentLapStats: () => any;
    getLapStats: (lapNumber: number) => any;
  };
}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  // Initial state
  session: {
    startTime: null,
    elapsedTime: 0,
    status: 'stopped',
    laps: [],
    activeUserIds: ['default'],
    isMultiUserMode: false
  },
  isRecording: false,
  multiUserSession: {
    userSessionData: {},
    sensorAssignments: {},
    activeUsers: new Set(['default'])
  },
  sessionData: {
    timestamps: [],
    power: [],
    heartRate: [],
    cadence: [],
    coreTemperature: [],
    skinTemperature: [],
    smo2: [],
    thb: [],
    targetPower: []
  },

  sessionActions: {
    // Session control
    startSession: () => {
      set((state) => {
        const now = Date.now();
        
        // ★ 修正: Resume機能の実装
        // セッションが停止状態で、既にelapsedTimeがある場合はResume
        if (state.session.status === 'stopped' && state.session.elapsedTime > 0) {
          console.log('Resuming session at:', new Date(now).toISOString());
          return {
            session: {
              ...state.session,
              status: 'running'
            },
            isRecording: true
          };
        }
        
        // 新しいセッション開始時に前回のデータをクリア
        get().sessionActions.clearAllSessionData();
        
        cadenceCalculatorManager.resetAll();
        console.log('Starting new session at:', new Date(now).toISOString());
        
        return {
          session: {
            ...state.session,
            startTime: now,
            elapsedTime: 0,
            status: 'running',
            laps: [],
            activeUserIds: ['default'],
            isMultiUserMode: false
          },
          isRecording: true
        };
      });
    },

    stopSession: () => {
      set((state) => {
        console.log('Session stopped - data preserved for export');
        
        // ★ 修正: データをクリアせず、セッション状態のみ変更
        return {
          session: {
            ...state.session,
            status: 'stopped'
          },
          isRecording: false
        };
      });
    },

    pauseSession: () => {
      set((state) => ({
        session: {
          ...state.session,
          status: 'paused'
        },
        isRecording: false 
      }));
    },

    // ★ 修正: addLap アクションの修正（lapTimes削除）
    addLap: (userId?: string) => {
      set((state) => {
        const currentTime = Date.now();
        const lapNumber = state.session.laps.length + 1;
        
        // ★ 修正: ラップ開始時刻の計算を改善
        if (!state.session.startTime) {
          console.warn('Session not started, cannot add lap');
          return state;
        }
        
        const startTime = state.session.laps.length > 0 
          ? state.session.laps[state.session.laps.length - 1].startTime + state.session.laps[state.session.laps.length - 1].duration
          : state.session.startTime || currentTime;
        const duration = currentTime - startTime;

        // Basic lap creation (detailed stats calculation would be implemented here)
        const lap: Lap = {
          lapNumber,
          startTime,
          duration,
          userId: userId,
          avgPower: null,
          maxPower: null,
          minPower: null,
          normalizedPower: null,
          avgHr: null,
          maxHr: null,
          minHr: null,
          avgCadence: null,
          maxCadence: null,
          minCadence: null,
          intensityFactor: null,
          work: null
        };

        return {
          session: {
            ...state.session,
            laps: [...state.session.laps, lap]
          }
        };
      });
    },

    updateElapsedTime: (deltaTime: number) => {
      set((state) => ({
        session: {
          ...state.session,
          elapsedTime: state.session.elapsedTime + deltaTime
        }
      }));
    },

    // Data recording
    recordSensorData: (data: { power?: number; heartRate?: number; cadence?: number }) => {
      set((state) => {
        if (!state.isRecording) return state;

        const timestamp = Date.now();
        return {
          sessionData: {
            timestamps: [...state.sessionData.timestamps, timestamp],
            power: [...state.sessionData.power, data.power || null],
            heartRate: [...state.sessionData.heartRate, data.heartRate || null],
            cadence: [...state.sessionData.cadence, data.cadence || null],
            coreTemperature: [...state.sessionData.coreTemperature, null],
            skinTemperature: [...state.sessionData.skinTemperature, null],
            smo2: [...state.sessionData.smo2, null],
            thb: [...state.sessionData.thb, null],
            targetPower: [...state.sessionData.targetPower, null]
          }
        };
      });
    },

    clearSessionData: () => {
      set(() => ({
        multiUserSession: {
          userSessionData: {},
          sensorAssignments: {},
          activeUsers: new Set()
        },
        sessionData: {
          timestamps: [],
          power: [],
          heartRate: [],
          cadence: [],
          coreTemperature: [],
          skinTemperature: [],
          smo2: [],
          thb: [],
          targetPower: []
        }
      }));
    },

    // ★ 新しいアクション: 全セッションデータのクリア
    clearAllSessionData: () => {
      set(() => ({
        session: {
          startTime: null,
          elapsedTime: 0,
          status: 'stopped',
          laps: [],
          activeUserIds: ['default'],
          isMultiUserMode: false
        },
        multiUserSession: {
          userSessionData: {},
          sensorAssignments: {},
          activeUsers: new Set(['default'])
        },
        sessionData: {
          timestamps: [],
          power: [],
          heartRate: [],
          cadence: [],
          coreTemperature: [],
          skinTemperature: [],
          smo2: [],
          thb: [],
          targetPower: []
        }
      }));
    },

    // ★ 新しいアクション: CSVエクスポート
    exportSessionData: () => {
      const state = get() as any; // 全体のストア状態を取得
      
      try {
        CSVExporter.exportSessionDataToCsv(
          state.sensorSessionData,
          state.userProfiles,
          state.savedSensors,
          state.session.startTime
        );
        
        toast.success('セッションデータをCSVファイルとしてエクスポートしました');
      } catch (error) {
        console.error('CSV export failed:', error);
        toast.error('CSVエクスポートに失敗しました');
      }
    },

    // ★ 新しいアクション: エクスポート可能データの確認
    hasExportableData: () => {
      const state = get() as any;
      return CSVExporter.hasExportableData(state.sensorSessionData);
    },

    // ★ 新しいアクション: エクスポート統計の取得
    getExportStats: () => {
      const state = get() as any;
      return CSVExporter.getExportStats(state.sensorSessionData);
    },

    // Multi-user data retrieval (placeholder implementations)
    getUserData: (userId: string, dataType: string) => {
      const state = get();
      const userSessionData = state.multiUserSession.userSessionData[userId];
      if (!userSessionData) return [];

      switch (dataType.toLowerCase()) {
        case 'power':
          return userSessionData.power;
        case 'heartrate':
          return userSessionData.heartRate;
        case 'cadence':
          return userSessionData.cadence;
        default:
          return [];
      }
    },

    getUserTimestamps: (userId: string) => {
      const state = get();
      const userSessionData = state.multiUserSession.userSessionData[userId];
      return userSessionData?.timestamps || [];
    },

    getUserStats: (userId: string, dataType: string, statType: 'max' | 'min' | 'avg') => {
      // Implementation would go here
      return null;
    },

    getUserLapStats: (userId: string, dataType: string, statType: 'max' | 'min' | 'avg') => {
      // Implementation would go here
      return null;
    },

    getUserSessionStats: (userId: string) => {
      // Implementation would go here
      return {};
    },

    // Statistics (placeholder implementations)
    getSessionStats: () => {
      // Implementation would go here
      return {};
    },

    getCurrentLapStats: () => {
      // Implementation would go here
      return {};
    },

    getLapStats: (lapNumber: number) => {
      // Implementation would go here
      return null;
    }
  }
});
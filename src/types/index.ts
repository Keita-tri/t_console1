import { Layout } from 'react-grid-layout';

// センサーの種別
export type SensorType = 'HeartRate' | 'CyclingPower' | 'CyclingSpeedCadence' | 'CoreBodyTemperature' | 'MuscleoxygenSensor' | 'SmartTrainer';

// データタイプの定義
export type DataType = 
  | 'power' | 'power3s' | 'normalizedPower' | 'maxPower' | 'avgPower' | 'minPower' | 'lapMaxPower' | 'lapAvgPower' | 'lapMinPower'
  | 'heartRate' | 'maxHeartRate' | 'avgHeartRate' | 'minHeartRate' | 'lapMaxHeartRate' | 'lapAvgHeartRate' | 'lapMinHeartRate'
  | 'cadence' | 'maxCadence' | 'avgCadence' | 'minCadence' | 'lapMaxCadence' | 'lapAvgCadence' | 'lapMinCadence'
  | 'coreTemperature' | 'skinTemperature'
  | 'smo2' | 'thb' | 'maxSmo2' | 'avgSmo2' | 'minSmo2' | 'maxThb' | 'avgThb' | 'minThb'
  | 'lapMaxSmo2' | 'lapAvgSmo2' | 'lapMinSmo2' | 'lapMaxThb' | 'lapAvgThb' | 'lapMinThb'
  | 'elapsedTime' | 'lapCount' | 'currentLapTime'
  | 'rawData' | 'flags'
  | 'targetPower' | 'trainerStatus';

// パネルタイプの定義
export type PanelType = 'data' | 'graph' | 'gauge' | 'chart' | 'trainer';

// トレーナーの種別
export type TrainerType = 'SmartTrainer' | 'PowerTrainer';

// ユーザープロファイル（統一）
export interface UserProfile {
  id: string;
  name: string;
  ftp: number;
  maxHr: number;
  color: string; // ユーザー固有の色
  powerZones: Zone[];
  hrZones: Zone[];
  createdAt: number;
  lastUsed: number;
  isActive: boolean; // セッション中にアクティブかどうか
  isProtected?: boolean; // 最後の一人を保護するためのフラグ
}

// 保存されたセンサー情報（ユーザー紐づけ追加）
export interface SavedSensorInfo {
  id: string;
  name: string | null;
  type: SensorType;
  lastConnected: number;
  userAlias?: string;
  assignedUserId?: string; // 現在紐づけられたユーザーID
  assignmentHistory: Array<{
    userId: string;
    assignedAt: number;
    unassignedAt?: number;
  }>; // 紐づけ履歴
}

// 接続されたセンサーのインスタンス情報
export interface ConnectedSensor {
  id: string;
  name: string | null;
  type: SensorType;
  device: BluetoothDevice;
  data: Record<string, number | null>;
  userAlias?: string;
  profileId?: string;
  assignedUserId?: string; // セッション中の紐づけ
}

// FTMS Bluetooth specifications
export interface BluetoothSpecs {
  FTMS_SERVICE_UUID: string;
  INDOOR_BIKE_DATA_UUID: string;
  CONTROL_POINT_UUID: string;
}

// Trainer state management
export interface TrainerState {
  connectionState: 'disconnected' | 'connecting' | 'connected';
  deviceName: string;
  trainerStatusMessage: string;
  activeMode: 'erg' | 'resistance' | 'simulation';
  targetValues: {
    power: number;
    resistance: number;
    grade: number;
  };
  lastSuccessfulValues: {
    resistance: number;
  };
}

// FTMS Command types
export interface FTMSCommand {
  opCode: number;
  parameters?: number[];
}

// スマートトレーナーのプロファイル
export interface TrainerProfile {
  serviceUUID: string;
  characteristics: {
    control: {
      uuid: string;
      writeType: 'writeWithResponse' | 'writeWithoutResponse';
    };
    status: {
      uuid: string;
    };
    indoorBikeData: {
      uuid: string;
    };
  };
  capabilities: {
    maxPower: number;
    minPower: number;
    powerResolution: number;
    supportsERG: boolean;
    supportsResistance: boolean;
    supportsSlope: boolean;
  };
}

// 接続されたトレーナー
export interface ConnectedTrainer {
  id: string;
  name: string | null;
  type: TrainerType;
  device: BluetoothDevice;
  profile: TrainerProfile;
  status: {
    currentPower: number | null;
    targetPower: number | null;
    mode: 'ERG' | 'Resistance' | 'Slope' | 'Manual';
    isCalibrated: boolean;
    connectionState: 'disconnected' | 'connecting' | 'connected';
    lastResponse: string;
  };
  controlPoint?: BluetoothRemoteGATTCharacteristic;
  assignedUserId?: string; // トレーナーもユーザーに紐づけ可能
}

// トレーナー制御コマンド
export interface TrainerCommand {
  type: 'setPower' | 'setResistance' | 'setSlope' | 'calibrate' | 'stop' | 'requestControl' | 'startTraining';
  value?: number;
  duration?: number;
}

// ゾーン設定
export interface Zone {
  threshold: number;
  color: string;
  name: string;
}

// パネル設定の拡張（マルチユーザー対応）
export interface PanelConfig {
  // 共通設定
  showUnit?: boolean;
  precision?: number;
  color?: string;
  
  // グラフ専用設定
  timeWindow?: number;
  yAxisScale?: {
    min?: number;
    max?: number;
    auto: boolean;
  };
  showGrid?: boolean;
  lineWidth?: number;
  showDataPoints?: boolean;
  
  // データパネル専用設定
  fontSize?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  
  // マルチユーザー表示設定
  multiUserDisplay?: {
    enabled: boolean;
    showUserColor: boolean; // ユーザー色で色分け
    showUserName: boolean;  // ユーザー名を表示
    forceUserId?: string;   // 強制的に特定ユーザーのデータを表示
  };
}

// パネルレイアウトの型定義
export interface PanelLayout extends Layout {
  panelType: PanelType;
  dataType: DataType;
  source?: {
    sensorId: string;
    dataKey: string;
  };
  displayName?: string;
  config?: PanelConfig;
}

// ラップ情報の型定義（ユーザー別対応）
export interface Lap {
  lapNumber: number;
  startTime: number;
  duration: number;
  userId?: string; // ラップを記録したユーザー
  avgPower: number | null;
  maxPower: number | null;
  minPower: number | null;
  normalizedPower: number | null;
  avgHr: number | null;
  maxHr: number | null;
  minHr: number | null;
  avgCadence: number | null;
  maxCadence: number | null;
  minCadence: number | null;
  intensityFactor: number | null;
  work: number | null;
}

// セッション情報（マルチユーザー対応）
export interface Session {
  startTime: number | null;
  elapsedTime: number;
  status: 'stopped' | 'running' | 'paused';
  laps: Lap[];
  activeUserIds: string[]; // セッション中のアクティブユーザー
  isMultiUserMode: boolean; // マルチユーザーモードかどうか
}

// センサープロファイル定義
export interface CharacteristicProfile {
  uuid: string;
  parser: (dataView: DataView, sensorId?: string) => Record<string, number>;
}

export interface SensorProfile {
  serviceUUID: string;
  characteristics: Record<string, CharacteristicProfile>;
}

// データタイプの設定情報
export interface DataTypeConfig {
  label: string;
  unit: string;
  requiresSensor: boolean;
  supportedSensorTypes?: SensorType[];
  category: 'power' | 'heartRate' | 'cadence' | 'temperature' | 'muscleOxygen' | 'session' | 'debug' | 'trainer';
  subcategory?: 'realtime' | 'calculated' | 'info' | 'control';
  description?: string;
  defaultPrecision?: number;
  defaultColor?: string;
}

// ユーザー別セッションデータ
export interface UserSessionData {
  userId: string;
  timestamps: number[];
  power: (number | null)[];
  heartRate: (number | null)[];
  cadence: (number | null)[];
  coreTemperature: (number | null)[];
  skinTemperature: (number | null)[];
  smo2: (number | null)[];
  thb: (number | null)[];
  targetPower: (number | null)[];
}

//センサー別のセッションデータ
export interface SensorSessionData {
  sensorId: string;
  sensorType: SensorType;
  userId?: string; // このセンサーが紐づけられたユーザー
  timestamps: number[];
  data: Record<string, (number | null)[]>;
}

// 統合されたセッションデータ（後方互換性のため）
export interface LegacySessionData {
  timestamps: number[];
  power: (number | null)[];
  heartRate: (number | null)[];
  cadence: (number | null)[];
  coreTemperature: (number | null)[];
  skinTemperature: (number | null)[];
  smo2: (number | null)[];
  thb: (number | null)[];
  targetPower: (number | null)[];
}

// マルチユーザーセッション管理
export interface MultiUserSessionManager {
  userSessionData: Record<string, UserSessionData>; // ユーザー別データ
  sensorAssignments: Record<string, string>; // sensorId -> userId
  activeUsers: Set<string>; // アクティブユーザーID
}
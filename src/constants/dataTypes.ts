import { DataTypeConfig, SensorType } from '../types';

export const DATA_TYPE_CONFIGS: Record<string, DataTypeConfig> = {
  // Power related
  power: {
    label: 'Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'realtime',
    description: 'Real-time power output',
    defaultPrecision: 0,
    defaultColor: '#3b82f6'
  },
  power3s: {
    label: '3s Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'realtime',
    description: '3-second moving average power',
    defaultPrecision: 0,
    defaultColor: '#2563eb'
  },
  normalizedPower: {
    label: 'Normalized Power',
    unit: 'W',
    requiresSensor: false,
    category: 'power',
    subcategory: 'calculated',
    description: 'Normalized power (4th root of 4th power mean of 30s moving average)',
    defaultPrecision: 0,
    defaultColor: '#1d4ed8'
  },
  maxPower: {
    label: 'Max Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Maximum power during session',
    defaultPrecision: 0,
    defaultColor: '#1e40af'
  },
  avgPower: {
    label: 'Avg Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Average power during session',
    defaultPrecision: 0,
    defaultColor: '#1e3a8a'
  },
  minPower: {
    label: 'Min Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Minimum power during session',
    defaultPrecision: 0,
    defaultColor: '#1e3a8a'
  },
  lapMaxPower: {
    label: 'Lap Max Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Maximum power in current lap',
    defaultPrecision: 0,
    defaultColor: '#3730a3'
  },
  lapAvgPower: {
    label: 'Lap Avg Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Average power in current lap',
    defaultPrecision: 0,
    defaultColor: '#312e81'
  },
  lapMinPower: {
    label: 'Lap Min Power',
    unit: 'W',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'power',
    subcategory: 'calculated',
    description: 'Minimum power in current lap',
    defaultPrecision: 0,
    defaultColor: '#312e81'
  },

  // Heart rate related
  heartRate: {
    label: 'Heart Rate',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'realtime',
    description: 'Real-time heart rate',
    defaultPrecision: 0,
    defaultColor: '#EF5350'
  },
  maxHeartRate: {
    label: 'Max Heart Rate',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Maximum heart rate during session',
    defaultPrecision: 0,
    defaultColor: '#f44336'
  },
  avgHeartRate: {
    label: 'Avg Heart Rate',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Average heart rate during session',
    defaultPrecision: 0,
    defaultColor: '#e53935'
  },
  minHeartRate: {
    label: 'Min Heart Rate',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Minimum heart rate during session',
    defaultPrecision: 0,
    defaultColor: '#e53935'
  },
  lapMaxHeartRate: {
    label: 'Lap Max HR',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Maximum heart rate in current lap',
    defaultPrecision: 0,
    defaultColor: '#d32f2f'
  },
  lapAvgHeartRate: {
    label: 'Lap Avg HR',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Average heart rate in current lap',
    defaultPrecision: 0,
    defaultColor: '#c62828'
  },
  lapMinHeartRate: {
    label: 'Lap Min HR',
    unit: 'bpm',
    requiresSensor: true,
    supportedSensorTypes: ['HeartRate'],
    category: 'heartRate',
    subcategory: 'calculated',
    description: 'Minimum heart rate in current lap',
    defaultPrecision: 0,
    defaultColor: '#c62828'
  },

  // Cadence related
  cadence: {
    label: 'Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'realtime',
    description: 'Pedal rotation rate (from power meter or cadence sensor)',
    defaultPrecision: 0,
    defaultColor: '#66BB6A'
  },
  maxCadence: {
    label: 'Max Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Maximum cadence during session',
    defaultPrecision: 0,
    defaultColor: '#4caf50'
  },
  avgCadence: {
    label: 'Avg Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Average cadence during session',
    defaultPrecision: 0,
    defaultColor: '#43a047'
  },
  minCadence: {
    label: 'Min Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Minimum cadence during session',
    defaultPrecision: 0,
    defaultColor: '#43a047'
  },
  lapMaxCadence: {
    label: 'Lap Max Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Maximum cadence in current lap',
    defaultPrecision: 0,
    defaultColor: '#388e3c'
  },
  lapAvgCadence: {
    label: 'Lap Avg Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Average cadence in current lap',
    defaultPrecision: 0,
    defaultColor: '#2e7d32'
  },
  lapMinCadence: {
    label: 'Lap Min Cadence',
    unit: 'rpm',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower', 'CyclingSpeedCadence'],
    category: 'cadence',
    subcategory: 'calculated',
    description: 'Minimum cadence in current lap',
    defaultPrecision: 0,
    defaultColor: '#2e7d32'
  },

  // Temperature related
  coreTemperature: {
    label: 'Core Temperature',
    unit: '°C',
    requiresSensor: true,
    supportedSensorTypes: ['CoreBodyTemperature'],
    category: 'temperature',
    subcategory: 'realtime',
    description: 'Core body temperature (CORE sensor etc.)',
    defaultPrecision: 1,
    defaultColor: '#FF7043'
  },
  skinTemperature: {
    label: 'Skin Temperature',
    unit: '°C',
    requiresSensor: true,
    supportedSensorTypes: ['CoreBodyTemperature'],
    category: 'temperature',
    subcategory: 'realtime',
    description: 'Skin surface temperature (CORE sensor etc.)',
    defaultPrecision: 1,
    defaultColor: '#FFA726'
  },

  // Muscle oxygen related
  smo2: {
    label: 'SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'realtime',
    description: 'Muscle oxygen saturation (Moxy, BSX etc.)',
    defaultPrecision: 1,
    defaultColor: '#7E57C2'
  },
  thb: {
    label: 'tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'realtime',
    description: 'Total hemoglobin concentration (Moxy, BSX etc.)',
    defaultPrecision: 2,
    defaultColor: '#9C27B0'
  },
  maxSmo2: {
    label: 'Max SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Maximum muscle oxygen saturation during session',
    defaultPrecision: 1,
    defaultColor: '#673AB7'
  },
  avgSmo2: {
    label: 'Avg SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Average muscle oxygen saturation during session',
    defaultPrecision: 1,
    defaultColor: '#5E35B1'
  },
  minSmo2: {
    label: 'Min SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Minimum muscle oxygen saturation during session',
    defaultPrecision: 1,
    defaultColor: '#512DA8'
  },
  maxThb: {
    label: 'Max tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Maximum total hemoglobin concentration during session',
    defaultPrecision: 2,
    defaultColor: '#8E24AA'
  },
  avgThb: {
    label: 'Avg tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Average total hemoglobin concentration during session',
    defaultPrecision: 2,
    defaultColor: '#7B1FA2'
  },
  minThb: {
    label: 'Min tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Minimum total hemoglobin concentration during session',
    defaultPrecision: 2,
    defaultColor: '#6A1B9A'
  },
  lapMaxSmo2: {
    label: 'Lap Max SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Maximum muscle oxygen saturation in current lap',
    defaultPrecision: 1,
    defaultColor: '#4A148C'
  },
  lapAvgSmo2: {
    label: 'Lap Avg SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Average muscle oxygen saturation in current lap',
    defaultPrecision: 1,
    defaultColor: '#4A148C'
  },
  lapMinSmo2: {
    label: 'Lap Min SmO2',
    unit: '%',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Minimum muscle oxygen saturation in current lap',
    defaultPrecision: 1,
    defaultColor: '#4A148C'
  },
  lapMaxThb: {
    label: 'Lap Max tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Maximum total hemoglobin concentration in current lap',
    defaultPrecision: 2,
    defaultColor: '#4A148C'
  },
  lapAvgThb: {
    label: 'Lap Avg tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Average total hemoglobin concentration in current lap',
    defaultPrecision: 2,
    defaultColor: '#4A148C'
  },
  lapMinThb: {
    label: 'Lap Min tHb',
    unit: 'g/dl',
    requiresSensor: true,
    supportedSensorTypes: ['MuscleoxygenSensor'],
    category: 'muscleOxygen',
    subcategory: 'calculated',
    description: 'Minimum total hemoglobin concentration in current lap',
    defaultPrecision: 2,
    defaultColor: '#4A148C'
  },
  
  // Session information
  elapsedTime: {
    label: 'Elapsed Time',
    unit: '',
    requiresSensor: false,
    category: 'session',
    subcategory: 'info',
    description: 'Time elapsed since session start',
    defaultPrecision: 0,
    defaultColor: '#607D8B'
  },
  lapCount: {
    label: 'Lap Count',
    unit: '',
    requiresSensor: false,
    category: 'session',
    subcategory: 'info',
    description: 'Current lap number',
    defaultPrecision: 0,
    defaultColor: '#78909C'
  },
  currentLapTime: {
    label: 'Current Lap Time',
    unit: '',
    requiresSensor: false,
    category: 'session',
    subcategory: 'info',
    description: 'Elapsed time of current lap',
    defaultPrecision: 0,
    defaultColor: '#90A4AE'
  },

  // RAW data display (for debugging)
  rawData: {
    label: 'RAW Data',
    unit: '',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'debug',
    subcategory: 'info',
    description: 'Raw data from sensor (hexadecimal display)',
    defaultPrecision: 0,
    defaultColor: '#455A64'
  },
  flags: {
    label: 'Flags',
    unit: '',
    requiresSensor: true,
    supportedSensorTypes: ['CyclingPower'],
    category: 'debug',
    subcategory: 'info',
    description: 'Data packet flag information',
    defaultPrecision: 0,
    defaultColor: '#546E7A'
  },

  // Trainer related
  targetPower: {
    label: 'Target Power',
    unit: 'W',
    requiresSensor: false,
    category: 'trainer',
    subcategory: 'control',
    description: 'Smart trainer target power setting',
    defaultPrecision: 0,
    defaultColor: '#FF9800'
  },
  trainerStatus: {
    label: 'Trainer Status',
    unit: '',
    requiresSensor: false,
    category: 'trainer',
    subcategory: 'info',
    description: 'Smart trainer operation status',
    defaultPrecision: 0,
    defaultColor: '#795548'
  }
};

export const DATA_TYPE_CATEGORIES = {
  power: 'Power',
  heartRate: 'Heart Rate',
  cadence: 'Cadence',
  temperature: 'Temperature',
  muscleOxygen: 'Muscle Oxygen',
  session: 'Session Info',
  debug: 'Debug Info',
  trainer: 'Trainer Control'
} as const;

export const DATA_TYPE_SUBCATEGORIES = {
  realtime: 'Real-time',
  calculated: 'Calculated',
  info: 'Information',
  control: 'Control'
} as const;
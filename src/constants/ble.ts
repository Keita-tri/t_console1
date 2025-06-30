import { SensorProfile, SensorType, TrainerProfile, TrainerType } from '../types';
import { cadenceCalculatorManager } from '../utils/cadenceCalculator';
import { BluetoothSpecs } from '../services/trainerService';

export const SENSOR_PROFILES: { [key in SensorType]: SensorProfile | TrainerProfile } = {
  HeartRate: {
    serviceUUID: '0000180d-0000-1000-8000-00805f9b34fb',
    characteristics: {
      measurement: {
        uuid: '00002a37-0000-1000-8000-00805f9b34fb',
        parser: (dataView: DataView) => {
          if (dataView.byteLength < 2) {
            return { value: 0 };
          }
          
          const flags = dataView.getUint8(0);
          const is16bitFormat = (flags & 0x1) !== 0;
          
          if (is16bitFormat && dataView.byteLength < 3) {
            return { value: 0 };
          }
          
          const heartRate = is16bitFormat ? dataView.getUint16(1, true) : dataView.getUint8(1);
          return { value: heartRate };
        }
      }
    }
  },
  CyclingPower: {
    serviceUUID: '00001818-0000-1000-8000-00805f9b34fb',
    characteristics: {
      measurement: {
        uuid: '00002a63-0000-1000-8000-00805f9b34fb',
        parser: (dataView: DataView, sensorId?: string) => {
          if (dataView.byteLength < 4) {
            return { power: 0, cadence: null, rawData: 'Insufficient data' };
          }
          
          // RAW data as hex string
          const rawBytes = Array.from(new Uint8Array(dataView.buffer))
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
          
          // Parse Flags field (bytes 0-1)
          const flags = dataView.getUint16(0, true);
          const flagsHex = '0x' + flags.toString(16).padStart(4, '0').toUpperCase();
          
          // Instantaneous Power (bytes 2-3) - required field
          const power = dataView.getUint16(2, true);
          
          let cadence: number | null = null;
          let byteOffset = 4; // Start of next data field
          
          // Detailed flag analysis
          const flagDetails = [];
          
          // Pedal Power Balance Present (bit 0)
          if (flags & 0x0001) {
            flagDetails.push('Pedal Power Balance');
            byteOffset += 1; // Skip 1 byte
          }
          
          // Pedal Power Balance Reference (bit 1) - no additional data
          if (flags & 0x0002) {
            flagDetails.push('Pedal Power Balance Reference');
          }
          
          // Accumulated Torque Present (bit 2)
          if (flags & 0x0004) {
            if (dataView.byteLength >= byteOffset + 2) {
              const accumulatedTorque = dataView.getUint16(byteOffset, true);
              flagDetails.push(`Accumulated Torque (${accumulatedTorque})`);
              byteOffset += 2; // Skip 2 bytes
            } else {
              flagDetails.push('Accumulated Torque (insufficient data)');
            }
          }
          
          // Accumulated Torque Source (bit 3) - no additional data
          if (flags & 0x0008) {
            flagDetails.push('Accumulated Torque Source');
          }
          
          // Wheel Revolution Data Present (bit 4)
          if (flags & 0x0010) {
            flagDetails.push('Wheel Revolution Data');
            byteOffset += 6; // Skip 6 bytes (4 bytes cumulative wheel revs + 2 bytes last wheel event time)
          }
          
          // Crank Revolution Data Present (bit 5) - used for cadence calculation
          if (flags & 0x0020) {
            if (dataView.byteLength >= byteOffset + 4) {
              // Cumulative Crank Revolutions (2 bytes)
              const cumulativeCrankRevolutions = dataView.getUint16(byteOffset, true);
              
              // Last Crank Event Time (2 bytes)
              const lastCrankEventTime = dataView.getUint16(byteOffset + 2, true);
              
              flagDetails.push(`Crank Revolution Data (Rev: ${cumulativeCrankRevolutions}, Time: ${lastCrankEventTime})`);
              
              // Use sensor-specific calculator if sensorId is provided
              if (sensorId) {
                const calculator = cadenceCalculatorManager.getCalculator(sensorId);
                cadence = calculator.calculateCadence(
                  cumulativeCrankRevolutions,
                  lastCrankEventTime
                );
                
                console.log(`[${sensorId}] Cadence calculation: Rev=${cumulativeCrankRevolutions}, Time=${lastCrankEventTime}, RPM=${cadence}`);
              } else {
                console.warn('No sensorId provided, skipping cadence calculation');
              }
            } else {
              flagDetails.push('Crank Revolution Data (insufficient data)');
            }
          }
          
          // Additional flags parsing
          if (flags & 0x0040) flagDetails.push('Extreme Force Magnitudes');
          if (flags & 0x0080) flagDetails.push('Extreme Torque Magnitudes');
          if (flags & 0x0100) flagDetails.push('Extreme Angles');
          if (flags & 0x0200) flagDetails.push('Top Dead Spot Angle');
          if (flags & 0x0400) flagDetails.push('Bottom Dead Spot Angle');
          if (flags & 0x0800) flagDetails.push('Accumulated Energy');
          if (flags & 0x1000) flagDetails.push('Offset Compensation Indicator');
          
          return { 
            power: power,
            cadence: cadence,
            rawData: rawBytes,
            flags: flagsHex,
            flagDetails: flagDetails.join(', ') || 'None',
            dataLength: dataView.byteLength
          };
        }
      }
    }
  },
  CyclingSpeedCadence: {
    serviceUUID: '00001816-0000-1000-8000-00805f9b34fb',
    characteristics: {
      measurement: {
        uuid: '00002a5b-0000-1000-8000-00805f9b34fb',
        parser: (dataView: DataView, sensorId?: string) => {
          if (dataView.byteLength < 1) {
            return { value: null };
          }
          
          const flags = dataView.getUint8(0);
          let cadence = null;
          
          // Check if crank revolution data is present and we have enough bytes
          if (flags & 0x02) {
            // Need at least 11 bytes for crank revolution data (1 byte flags + 6 bytes wheel + 4 bytes crank)
            if (dataView.byteLength >= 11) {
              const crankRevolutions = dataView.getUint16(7, true);
              const lastCrankEventTime = dataView.getUint16(9, true);
              
              // Use sensor-specific calculator if sensorId is provided
              if (sensorId) {
                const calculator = cadenceCalculatorManager.getCalculator(sensorId);
                cadence = calculator.calculateCadence(crankRevolutions, lastCrankEventTime);
                console.log(`[${sensorId}] CyclingSpeedCadence cadence calculation: Rev=${crankRevolutions}, Time=${lastCrankEventTime}, RPM=${cadence}`);
              } else {
                // Legacy method (for backward compatibility)
                cadence = crankRevolutions;
              }
            }
          }
          
          return { value: cadence };
        }
      }
    }
  },
  CoreBodyTemperature: {
    serviceUUID: '00002100-5b1e-4347-b07c-97b514dae121',
    characteristics: {
      measurement: {
        uuid: '00002101-5b1e-4347-b07c-97b514dae121',
        parser: (dataView: DataView) => {
          if (dataView.byteLength < 10) {
            return { 
              coreTemperature: null,
              skinTemperature: null
            };
          }
          
          // CORE sensor data structure parsing
          // Bytes 1-2: Core temperature (Uint16 LE, /100.0)
          const coreTemp = dataView.getUint16(1, true) / 100.0;
          
          // Bytes 3-4: Skin temperature (Uint16 LE, /100.0)
          const skinTemp = dataView.getUint16(3, true) / 100.0;
          
          return { 
            coreTemperature: coreTemp,
            skinTemperature: skinTemp
          };
        }
      }
    }
  },
  MuscleoxygenSensor: {
    serviceUUID: '6404d801-4cb9-11e8-b566-0800200c9a66', // Moxy service
    characteristics: {
      measurement: {
        uuid: '6404d804-4cb9-11e8-b566-0800200c9a66', // Data source (Notify)
        parser: (dataView: DataView, sensorId?: string) => {
          console.log(`[${sensorId || 'Unknown'}] Moxy data received: ${dataView.byteLength} bytes`);
          
          // Log RAW data for debugging
          const rawBytes = Array.from(new Uint8Array(dataView.buffer))
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
          console.log(`[${sensorId || 'Unknown'}] RAW data: ${rawBytes}`);
          
          // Parse 9-byte data packet
          if (dataView.byteLength >= 9) {
            try {
              // SmO₂ (muscle oxygen saturation) - bytes 2-3 (little endian)
              const smo2Raw = dataView.getUint16(2, true);
              const smo2 = smo2Raw / 10.0;
              
              // THb (total hemoglobin) - bytes 6-7 (little endian)
              const thbRaw = dataView.getUint16(6, true);
              const thb = thbRaw / 100.0;
              
              console.log(`[${sensorId || 'Unknown'}] Parsed: SmO₂=${smo2}%, THb=${thb}g/dL`);
              
              return {
                smo2: Math.round(smo2 * 10) / 10, // Round to 1 decimal place
                thb: Math.round(thb * 100) / 100   // Round to 2 decimal places
              };
            } catch (error) {
              console.error(`[${sensorId || 'Unknown'}] Moxy data parsing error:`, error);
              return { smo2: 0, thb: 0 };
            }
          } else {
            console.warn(`[${sensorId || 'Unknown'}] Insufficient Moxy data: ${dataView.byteLength} bytes (9 needed)`);
            return { smo2: 0, thb: 0 };
          }
        }
      },
      trigger: {
        uuid: '6404d811-4cb9-11e8-b566-0800200c9a66', // Trigger characteristic (Write)
        writeType: 'writeWithResponse'
      }
    }
  },
  SmartTrainer: {
    serviceUUID: BluetoothSpecs.FTMS_SERVICE_UUID, // Fitness Machine Service
    characteristics: {
      control: {
        uuid: BluetoothSpecs.CONTROL_POINT_UUID, // Fitness Machine Control Point
        writeType: 'writeWithResponse'
      },
      status: {
        uuid: BluetoothSpecs.CONTROL_POINT_UUID // Fitness Machine Status
      },
      indoorBikeData: {
        uuid: BluetoothSpecs.INDOOR_BIKE_DATA_UUID // Indoor Bike Data
      }
    },
    capabilities: {
      maxPower: 2000,
      minPower: 0,
      powerResolution: 1,
      supportsERG: true,
      supportsResistance: true,
      supportsSlope: false
    }
  }
};

// Apply exact color codes from JSON
export const DEFAULT_POWER_ZONES = [
  { threshold: 0.55, color: '#B0BEC5', name: 'Active Recovery' }, // Z1
  { threshold: 0.75, color: '#4FC3F7', name: 'Endurance' }, // Z2
  { threshold: 0.90, color: '#66BB6A', name: 'Tempo' }, // Z3
  { threshold: 1.05, color: '#FFEE58', name: 'LT' }, // Z4
  { threshold: 1.20, color: '#FF7043', name: 'VO2max' }, // Z5
  { threshold: 1.50, color: '#EF5350', name: 'Anaerobic Capacity' }, // Z6
  { threshold: Infinity, color: '#7E57C2', name: 'Neuromuscular Power' } // Z7
];

export const DEFAULT_HR_ZONES = [
  { threshold: 0.68, color: '#B0BEC5', name: 'Recovery' }, // Z1
  { threshold: 0.83, color: '#4FC3F7', name: 'Endurance' }, // Z2
  { threshold: 0.94, color: '#66BB6A', name: 'Tempo' }, // Z3
  { threshold: 1.00, color: '#FFA726', name: 'LT' }, // Z4
  { threshold: Infinity, color: '#EF5350', name: 'VO2max' } // Z5
];
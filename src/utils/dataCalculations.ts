/**
 * Data calculation utilities - Integrated calculation processing
 */

import { CalculationEngine } from './calculationUtils';
import { SessionStatisticsCalculator } from './sessionStatistics';

// Sensor-specific data statistics calculation
export class SensorDataCalculator {
  /**
   * Calculate sensor-specific statistics
   */
  static calculateSensorStats(
    sensorData: any,
    dataType: string,
    statType: 'max' | 'min' | 'avg'
  ): number | null {
    if (!sensorData) return null;

    const data = this.extractDataByType(sensorData, dataType);
    
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
  }

  /**
   * Calculate sensor-specific lap statistics
   */
  static calculateSensorLapStats(
    sensorData: any,
    dataType: string,
    statType: 'max' | 'min' | 'avg',
    lapStartTime: number,
    currentTime: number
  ): number | null {
    if (!sensorData) return null;

    // Get data indices within lap range
    const lapIndices = sensorData.timestamps
      .map((timestamp: number, index: number) => ({ timestamp, index }))
      .filter(({ timestamp }: { timestamp: number }) => 
        timestamp >= lapStartTime && timestamp <= currentTime
      )
      .map(({ index }: { index: number }) => index);

    if (lapIndices.length === 0) return null;

    const allData = this.extractDataByType(sensorData, dataType);
    const lapData = lapIndices.map(index => allData[index]);

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
  }

  /**
   * Extract appropriate data by data type
   */
  static extractDataByType(sensorData: any, dataType: string): (number | null)[] {
    const normalizedType = dataType.toLowerCase();
    
    switch (normalizedType) {
      case 'power':
        return sensorData.data.power || [];
      case 'heartrate':
        return sensorData.data.value || [];
      case 'cadence':
        return sensorData.data.cadence || sensorData.data.value || [];
      case 'coretemperature':
        return sensorData.data.coreTemperature || [];
      case 'skintemperature':
        return sensorData.data.skinTemperature || [];
      case 'smo2':
        return sensorData.data.smo2 || [];
      case 'thb':
        return sensorData.data.thb || [];
      default:
        return sensorData.data[dataType] || [];
    }
  }
}

// Value formatting processing
export class ValueFormatter {
  static formatValue(value: number | null, precision: number = 0): string {
    if (value === null || value === undefined) return '--';
    return value.toFixed(precision);
  }

  static formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  static formatSensorTypeName(sensorType: string): string {
    const typeMap: Record<string, string> = {
      'CyclingPower': 'Power Meter',
      'CyclingSpeedCadence': 'Speed & Cadence',
      'HeartRate': 'Heart Rate',
      'CoreBodyTemperature': 'Temperature',
      'MuscleoxygenSensor': 'Muscle Oxygen'
    };
    return typeMap[sensorType] || sensorType;
  }
}

// Zone-related processing
export class ZoneCalculator {
  static getZoneColor(value: number | null, zones: any[], maxValue?: number): string {
    if (value === null || value === undefined) return '';
    
    const normalizedValue = maxValue ? value / maxValue : value;
    
    for (const zone of zones) {
      if (normalizedValue <= zone.threshold) {
        return zone.color;
      }
    }
    
    return zones[zones.length - 1]?.color || '';
  }
}
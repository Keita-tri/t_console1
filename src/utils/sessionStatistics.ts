/**
 * セッション・ラップ統計計算モジュール
 * 全体統計とラップ統計の計算を担当
 */

import { CalculationEngine } from './calculationUtils';
import { Lap, UserProfile } from '../types';

export interface SessionStatistics {
  // パワー統計
  avgPower: number | null;
  maxPower: number | null;
  minPower: number | null;
  normalizedPower: number | null;
  
  // 心拍統計
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  minHeartRate: number | null;
  
  // ケイデンス統計
  avgCadence: number | null;
  maxCadence: number | null;
  minCadence: number | null;
  
  // その他
  duration: number;
  work: number | null;
  intensityFactor: number | null;
  tss: number | null;
}

export interface LapStatistics extends SessionStatistics {
  lapNumber: number;
  startTime: number;
}

export class SessionStatisticsCalculator {
  /**
   * セッション全体の統計を計算
   */
  static calculateSessionStats(
    sessionData: {
      timestamps: number[];
      power: (number | null)[];
      heartRate: (number | null)[];
      cadence: (number | null)[];
    },
    userProfile: UserProfile
  ): SessionStatistics {
    const { timestamps, power, heartRate, cadence } = sessionData;
    
    if (timestamps.length === 0) {
      return this.getEmptyStats(0);
    }

    const duration = timestamps[timestamps.length - 1] - timestamps[0];
    
    // パワー統計
    const avgPower = CalculationEngine.calculateAverage(power);
    const maxPower = CalculationEngine.calculateMax(power);
    const minPower = CalculationEngine.calculateMin(power);
    const normalizedPower = CalculationEngine.calculateNormalizedPower(power, timestamps);
    
    // 心拍統計
    const avgHeartRate = CalculationEngine.calculateAverage(heartRate);
    const maxHeartRate = CalculationEngine.calculateMax(heartRate);
    const minHeartRate = CalculationEngine.calculateMin(heartRate);
    
    // ケイデンス統計
    const avgCadence = CalculationEngine.calculateAverage(cadence);
    const maxCadence = CalculationEngine.calculateMax(cadence);
    const minCadence = CalculationEngine.calculateMin(cadence);
    
    // その他の計算
    const work = CalculationEngine.calculateWork(power, timestamps);
    const intensityFactor = CalculationEngine.calculateIntensityFactor(normalizedPower, userProfile.ftp);
    const tss = CalculationEngine.calculateTSS(normalizedPower, duration, userProfile.ftp);

    return {
      avgPower,
      maxPower,
      minPower,
      normalizedPower,
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      avgCadence,
      maxCadence,
      minCadence,
      duration,
      work,
      intensityFactor,
      tss
    };
  }

  /**
   * 現在のラップの統計を計算
   */
  static calculateCurrentLapStats(
    sessionData: {
      timestamps: number[];
      power: (number | null)[];
      heartRate: (number | null)[];
      cadence: (number | null)[];
    },
    laps: Lap[],
    sessionStartTime: number | null,
    userProfile: UserProfile
  ): LapStatistics | null {
    if (!sessionStartTime) return null;

    const currentTime = Date.now();
    const lapNumber = laps.length + 1;
    
    // 現在のラップの開始時刻を計算
    const startTime = laps.length > 0 
      ? laps[laps.length - 1].startTime + laps[laps.length - 1].duration
      : sessionStartTime;

    // 現在のラップの範囲でデータをフィルタリング
    const lapIndices = sessionData.timestamps
      .map((t, i) => ({ time: t, index: i }))
      .filter(({ time }) => time >= startTime && time <= currentTime)
      .map(({ index }) => index);

    if (lapIndices.length === 0) {
      return {
        ...this.getEmptyStats(currentTime - startTime),
        lapNumber,
        startTime
      };
    }

    const lapPower = lapIndices.map(i => sessionData.power[i]);
    const lapHeartRate = lapIndices.map(i => sessionData.heartRate[i]);
    const lapCadence = lapIndices.map(i => sessionData.cadence[i]);
    const lapTimestamps = lapIndices.map(i => sessionData.timestamps[i]);

    const duration = currentTime - startTime;
    
    // ラップ統計の計算
    const avgPower = CalculationEngine.calculateAverage(lapPower);
    const maxPower = CalculationEngine.calculateMax(lapPower);
    const minPower = CalculationEngine.calculateMin(lapPower);
    const normalizedPower = CalculationEngine.calculateNormalizedPower(lapPower, lapTimestamps);
    
    const avgHeartRate = CalculationEngine.calculateAverage(lapHeartRate);
    const maxHeartRate = CalculationEngine.calculateMax(lapHeartRate);
    const minHeartRate = CalculationEngine.calculateMin(lapHeartRate);
    
    const avgCadence = CalculationEngine.calculateAverage(lapCadence);
    const maxCadence = CalculationEngine.calculateMax(lapCadence);
    const minCadence = CalculationEngine.calculateMin(lapCadence);
    
    const work = CalculationEngine.calculateWork(lapPower, lapTimestamps);
    const intensityFactor = CalculationEngine.calculateIntensityFactor(normalizedPower, userProfile.ftp);
    const tss = CalculationEngine.calculateTSS(normalizedPower, duration, userProfile.ftp);

    return {
      lapNumber,
      startTime,
      avgPower,
      maxPower,
      minPower,
      normalizedPower,
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      avgCadence,
      maxCadence,
      minCadence,
      duration,
      work,
      intensityFactor,
      tss
    };
  }

  /**
   * 指定されたラップの統計を計算
   */
  static calculateLapStats(
    lap: Lap,
    sessionData: {
      timestamps: number[];
      power: (number | null)[];
      heartRate: (number | null)[];
      cadence: (number | null)[];
    },
    userProfile: UserProfile
  ): LapStatistics {
    const endTime = lap.startTime + lap.duration;
    
    // ラップの範囲でデータをフィルタリング
    const lapIndices = sessionData.timestamps
      .map((t, i) => ({ time: t, index: i }))
      .filter(({ time }) => time >= lap.startTime && time <= endTime)
      .map(({ index }) => index);

    if (lapIndices.length === 0) {
      return {
        ...this.getEmptyStats(lap.duration),
        lapNumber: lap.lapNumber,
        startTime: lap.startTime
      };
    }

    const lapPower = lapIndices.map(i => sessionData.power[i]);
    const lapHeartRate = lapIndices.map(i => sessionData.heartRate[i]);
    const lapCadence = lapIndices.map(i => sessionData.cadence[i]);
    const lapTimestamps = lapIndices.map(i => sessionData.timestamps[i]);

    // 統計計算
    const avgPower = CalculationEngine.calculateAverage(lapPower);
    const maxPower = CalculationEngine.calculateMax(lapPower);
    const minPower = CalculationEngine.calculateMin(lapPower);
    const normalizedPower = CalculationEngine.calculateNormalizedPower(lapPower, lapTimestamps);
    
    const avgHeartRate = CalculationEngine.calculateAverage(lapHeartRate);
    const maxHeartRate = CalculationEngine.calculateMax(lapHeartRate);
    const minHeartRate = CalculationEngine.calculateMin(lapHeartRate);
    
    const avgCadence = CalculationEngine.calculateAverage(lapCadence);
    const maxCadence = CalculationEngine.calculateMax(lapCadence);
    const minCadence = CalculationEngine.calculateMin(lapCadence);
    
    const work = CalculationEngine.calculateWork(lapPower, lapTimestamps);
    const intensityFactor = CalculationEngine.calculateIntensityFactor(normalizedPower, userProfile.ftp);
    const tss = CalculationEngine.calculateTSS(normalizedPower, lap.duration, userProfile.ftp);

    return {
      lapNumber: lap.lapNumber,
      startTime: lap.startTime,
      avgPower,
      maxPower,
      minPower,
      normalizedPower,
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      avgCadence,
      maxCadence,
      minCadence,
      duration: lap.duration,
      work,
      intensityFactor,
      tss
    };
  }

  /**
   * 空の統計データを生成
   */
  private static getEmptyStats(duration: number): SessionStatistics {
    return {
      avgPower: null,
      maxPower: null,
      minPower: null,
      normalizedPower: null,
      avgHeartRate: null,
      maxHeartRate: null,
      minHeartRate: null,
      avgCadence: null,
      maxCadence: null,
      minCadence: null,
      duration,
      work: null,
      intensityFactor: null,
      tss: null
    };
  }

  /**
   * 統計データの有効性をチェック
   */
  static hasValidData(stats: SessionStatistics | LapStatistics): boolean {
    return stats.avgPower !== null || 
           stats.avgHeartRate !== null || 
           stats.avgCadence !== null;
  }

  /**
   * 統計データを文字列形式でフォーマット
   */
  static formatStats(stats: SessionStatistics | LapStatistics): string {
    const parts: string[] = [];
    
    if (stats.avgPower !== null) {
      parts.push(`パワー: ${stats.avgPower}W (最大: ${stats.maxPower}W, 最小: ${stats.minPower}W)`);
    }
    
    if (stats.avgHeartRate !== null) {
      parts.push(`心拍: ${stats.avgHeartRate}bpm (最大: ${stats.maxHeartRate}bpm, 最小: ${stats.minHeartRate}bpm)`);
    }
    
    if (stats.avgCadence !== null) {
      parts.push(`ケイデンス: ${stats.avgCadence}rpm (最大: ${stats.maxCadence}rpm, 最小: ${stats.minCadence}rpm)`);
    }
    
    return parts.join(', ');
  }
}
/**
 * 計算エンジン - 全ての計算処理を統合管理
 */
export class CalculationEngine {
  /**
   * Normalized Power (NP) の計算
   * 30秒間の移動平均の4乗平均の4乗根を求める
   */
  static calculateNormalizedPower(powerData: (number | null)[], timestamps: number[]): number | null {
    if (!powerData.length || !timestamps.length) return null;

    const validPowers = powerData.filter((p): p is number => p !== null && p > 0);
    if (validPowers.length < 30) return null; // 30秒未満のデータでは計算しない

    // 30秒間隔で移動平均を計算
    const thirtySecondAverages: number[] = [];
    const windowSize = 30; // 30秒

    for (let i = windowSize - 1; i < validPowers.length; i++) {
      const windowSum = validPowers.slice(i - windowSize + 1, i + 1).reduce((sum, p) => sum + p, 0);
      thirtySecondAverages.push(windowSum / windowSize);
    }

    // 4乗平均の4乗根を計算
    const fourthPowerSum = thirtySecondAverages.reduce((sum, avg) => sum + Math.pow(avg, 4), 0);
    const normalizedPower = Math.pow(fourthPowerSum / thirtySecondAverages.length, 1/4);

    return Math.round(normalizedPower);
  }

  /**
   * 3秒パワーの計算（3秒間の移動平均）
   */
  static calculate3sPower(powerData: (number | null)[], timestamps: number[]): number | null {
    if (!powerData.length || !timestamps.length) return null;

    const validData = powerData
      .map((power, index) => ({ power, timestamp: timestamps[index] }))
      .filter(item => item.power !== null);

    if (validData.length < 3) return null;

    // 最新の3秒間のデータを取得
    const now = Date.now();
    const threeSecondsAgo = now - 3000;
    
    const recentData = validData
      .filter(item => item.timestamp >= threeSecondsAgo)
      .map(item => item.power as number);

    if (recentData.length === 0) return null;

    const sum = recentData.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / recentData.length);
  }

  /**
   * Intensity Factor (IF) の計算
   * NP / FTP
   */
  static calculateIntensityFactor(normalizedPower: number | null, ftp: number): number | null {
    if (!normalizedPower || ftp <= 0) return null;
    return Math.round((normalizedPower / ftp) * 100) / 100; // 小数点2桁に丸める
  }

  /**
   * Training Stress Score (TSS) の計算
   * (NP/FTP)² × 時間(h) × 100
   */
  static calculateTSS(normalizedPower: number | null, duration: number, ftp: number): number | null {
    if (!normalizedPower || ftp <= 0 || duration <= 0) return null;
    const intensityFactor = normalizedPower / ftp;
    const hours = duration / (1000 * 60 * 60); // ミリ秒から時間に変換
    return Math.round(Math.pow(intensityFactor, 2) * hours * 100);
  }

  /**
   * Work (kJ) の計算
   * パワーの積分値
   */
  static calculateWork(powerData: (number | null)[], timestamps: number[]): number | null {
    if (!powerData.length || !timestamps.length) return null;

    let totalWork = 0;
    for (let i = 1; i < powerData.length; i++) {
      const power = powerData[i];
      const prevPower = powerData[i - 1];
      if (power !== null && prevPower !== null) {
        const timeDiff = (timestamps[i] - timestamps[i - 1]) / 1000; // 秒に変換
        const avgPower = (power + prevPower) / 2;
        totalWork += avgPower * timeDiff;
      }
    }

    return Math.round(totalWork / 1000); // kJに変換
  }

  /**
   * 平均値の計算
   */
  static calculateAverage(data: (number | null)[]): number | null {
    const validData = data.filter((d): d is number => d !== null);
    if (validData.length === 0) return null;
    
    const sum = validData.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / validData.length);
  }

  /**
   * 最大値の計算
   */
  static calculateMax(data: (number | null)[]): number | null {
    const validData = data.filter((d): d is number => d !== null);
    if (validData.length === 0) return null;
    
    return Math.max(...validData);
  }

  /**
   * 最小値の計算
   */
  static calculateMin(data: (number | null)[]): number | null {
    const validData = data.filter((d): d is number => d !== null);
    if (validData.length === 0) return null;
    
    return Math.min(...validData);
  }

  /**
   * パーセンタイル値の計算
   */
  static calculatePercentile(data: (number | null)[], percentile: number): number | null {
    const validData = data.filter((d): d is number => d !== null).sort((a, b) => a - b);
    if (validData.length === 0) return null;
    
    const index = (percentile / 100) * (validData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return validData[lower];
    }
    
    const weight = index - lower;
    return validData[lower] * (1 - weight) + validData[upper] * weight;
  }

  /**
   * ゾーンカラーの取得
   */
  static getZoneColor(value: number, zones: { threshold: number; color: string }[], maxValue?: number): string {
    if (value === null || value === undefined) return '';
    
    const normalizedValue = maxValue ? value / maxValue : value;
    
    for (const zone of zones) {
      if (normalizedValue <= zone.threshold) {
        return zone.color;
      }
    }
    
    return zones[zones.length - 1]?.color || '';
  }

  /**
   * ゾーンインデックスの取得
   */
  static getZoneIndex(value: number, zones: { threshold: number }[], maxValue?: number): number {
    if (value === null || value === undefined) return -1;
    
    const normalizedValue = maxValue ? value / maxValue : value;
    
    for (let i = 0; i < zones.length; i++) {
      if (normalizedValue <= zones[i].threshold) {
        return i;
      }
    }
    
    return zones.length - 1;
  }

  /**
   * ゾーン別時間の計算
   */
  static calculateTimeInZones(
    data: (number | null)[], 
    zones: { threshold: number }[], 
    maxValue?: number
  ): Record<number, number> {
    const timeInZones: Record<number, number> = {};
    
    // 初期化
    for (let i = 0; i < zones.length; i++) {
      timeInZones[i] = 0;
    }
    
    data.forEach(value => {
      if (value !== null) {
        const zoneIndex = this.getZoneIndex(value, zones, maxValue);
        if (zoneIndex >= 0) {
          timeInZones[zoneIndex] += 1; // 1秒間隔と仮定
        }
      }
    });
    
    return timeInZones;
  }

  /**
   * 移動平均の計算
   */
  static calculateMovingAverage(data: (number | null)[], windowSize: number): (number | null)[] {
    if (windowSize <= 0) return data;
    
    const result: (number | null)[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const validValues = window.filter((v): v is number => v !== null);
      
      if (validValues.length > 0) {
        const sum = validValues.reduce((acc, val) => acc + val, 0);
        result.push(sum / validValues.length);
      } else {
        result.push(null);
      }
    }
    
    return result;
  }

  /**
   * 指数移動平均の計算
   */
  static calculateExponentialMovingAverage(data: (number | null)[], alpha: number): (number | null)[] {
    if (alpha <= 0 || alpha > 1) return data;
    
    const result: (number | null)[] = [];
    let ema: number | null = null;
    
    for (const value of data) {
      if (value !== null) {
        if (ema === null) {
          ema = value;
        } else {
          ema = alpha * value + (1 - alpha) * ema;
        }
        result.push(ema);
      } else {
        result.push(null);
      }
    }
    
    return result;
  }

  /**
   * 時間範囲内のデータから統計値を計算
   */
  static calculateRangeStats(
    data: (number | null)[],
    timestamps: number[],
    startTime: number,
    endTime: number,
    ftp: number = 250
  ) {
    const rangeIndices = timestamps
      .map((t, i) => ({ time: t, index: i }))
      .filter(({ time }) => time >= startTime && time <= endTime)
      .map(({ index }) => index);

    if (rangeIndices.length === 0) {
      return {
        avg: null,
        max: null,
        min: null,
        normalizedPower: null,
        intensityFactor: null,
        work: null,
        tss: null
      };
    }

    const rangeData = rangeIndices.map(i => data[i]);
    const rangeTimestamps = rangeIndices.map(i => timestamps[i]);

    const avg = this.calculateAverage(rangeData);
    const max = this.calculateMax(rangeData);
    const min = this.calculateMin(rangeData);
    const normalizedPower = this.calculateNormalizedPower(rangeData, rangeTimestamps);
    const intensityFactor = this.calculateIntensityFactor(normalizedPower, ftp);
    const work = this.calculateWork(rangeData, rangeTimestamps);
    const duration = endTime - startTime;
    const tss = this.calculateTSS(normalizedPower, duration, ftp);

    return {
      avg,
      max,
      min,
      normalizedPower,
      intensityFactor,
      work,
      tss
    };
  }

  /**
   * リアルタイムでの移動平均計算
   */
  static calculateRealtimeMovingAverage(
    data: (number | null)[],
    timestamps: number[],
    windowSeconds: number
  ): number | null {
    if (!data.length || !timestamps.length) return null;

    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    const validData = data
      .map((value, index) => ({ value, timestamp: timestamps[index] }))
      .filter(item => item.value !== null && item.timestamp >= windowStart)
      .map(item => item.value as number);

    if (validData.length === 0) return null;

    const sum = validData.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / validData.length);
  }
}

// 後方互換性のための関数エクスポート
export const calculateNormalizedPower = CalculationEngine.calculateNormalizedPower;
export const calculate3sPower = CalculationEngine.calculate3sPower;
export const calculateIntensityFactor = CalculationEngine.calculateIntensityFactor;
export const calculateWork = CalculationEngine.calculateWork;
export const calculateAverage = CalculationEngine.calculateAverage;
export const calculateMax = CalculationEngine.calculateMax;
export const calculateMin = CalculationEngine.calculateMin;
export const calculateRangeStats = CalculationEngine.calculateRangeStats;
export const calculateMovingAverage = CalculationEngine.calculateRealtimeMovingAverage;

/**
 * セッション全体の統計計算
 */
export function calculateSessionStats(sessionData: {
  timestamps: number[];
  power: (number | null)[];
  heartRate: (number | null)[];
  cadence: (number | null)[];
}, userProfile: { ftp: number; maxHr: number }) {
  const { timestamps, power, heartRate, cadence } = sessionData;
  
  if (timestamps.length === 0) {
    return {
      duration: 0,
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
      intensityFactor: null,
      work: null,
      tss: null
    };
  }

  const duration = timestamps[timestamps.length - 1] - timestamps[0];
  const avgPower = CalculationEngine.calculateAverage(power);
  const maxPower = CalculationEngine.calculateMax(power);
  const minPower = CalculationEngine.calculateMin(power);
  const normalizedPower = CalculationEngine.calculateNormalizedPower(power, timestamps);
  const avgHeartRate = CalculationEngine.calculateAverage(heartRate);
  const maxHeartRate = CalculationEngine.calculateMax(heartRate);
  const minHeartRate = CalculationEngine.calculateMin(heartRate);
  const avgCadence = CalculationEngine.calculateAverage(cadence);
  const maxCadence = CalculationEngine.calculateMax(cadence);
  const minCadence = CalculationEngine.calculateMin(cadence);
  const intensityFactor = CalculationEngine.calculateIntensityFactor(normalizedPower, userProfile.ftp);
  const work = CalculationEngine.calculateWork(power, timestamps);
  const tss = CalculationEngine.calculateTSS(normalizedPower, duration, userProfile.ftp);

  return {
    duration,
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
    intensityFactor,
    work,
    tss
  };
}
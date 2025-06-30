/**
 * ケイデンス計算ユーティリティ
 * Cycling Power Service (CPS) のクランク回転数データからRPMを計算
 */

export interface CrankData {
  cumulativeCrankRevolutions: number;
  lastCrankEventTime: number;
  timestamp: number;
}

export class CadenceCalculator {
  private previousCrankData: CrankData | null = null;
  private sensorId: string;

  constructor(sensorId: string) {
    this.sensorId = sensorId;
  }

  /**
   * クランク回転数データからケイデンス（RPM）を計算
   * @param cumulativeCrankRevolutions 累積クランク回転数 (Uint16)
   * @param lastCrankEventTime 最終イベント時刻 (Uint16, 単位: 1/1024秒)
   * @returns ケイデンス（RPM）または null
   */
  calculateCadence(
    cumulativeCrankRevolutions: number,
    lastCrankEventTime: number
  ): number | null {
    const currentTimestamp = Date.now();
    const currentCrankData: CrankData = {
      cumulativeCrankRevolutions,
      lastCrankEventTime,
      timestamp: currentTimestamp
    };

    // 初回データの場合は計算できない
    if (!this.previousCrankData) {
      this.previousCrankData = currentCrankData;
      console.log(`[${this.sensorId}] 初回データ: 計算不可`);
      return null;
    }

    // 前回データとの差分を計算
    const revolutionDiff = this.calculateDifference(
      cumulativeCrankRevolutions,
      this.previousCrankData.cumulativeCrankRevolutions,
      65536 // Uint16の最大値 + 1
    );

    const timeDiff = this.calculateDifference(
      lastCrankEventTime,
      this.previousCrankData.lastCrankEventTime,
      65536 // Uint16の最大値 + 1
    );

    console.log(`[${this.sensorId}] 差分計算: Rev差分=${revolutionDiff}, Time差分=${timeDiff}`);

    // ★ 修正: 時間差が0の場合は計算をスキップするが、前回データは更新しない
    if (timeDiff === 0) {
      // 時間差が0の場合、RPMは変化なしと見なし、計算をスキップするが、
      // 前回データは更新しないことで、次回データとの差分計算を可能にする。
      console.log(`[${this.sensorId}] 時間差が0: 計算スキップ`);
      return null;
    }

    // 経過時間を秒に変換 (1/1024秒単位から秒へ)
    const elapsedTimeSeconds = timeDiff / 1024;
    console.log(`[${this.sensorId}] 経過時間: ${elapsedTimeSeconds}秒`);

    // RPMを計算
    const rpm = (revolutionDiff / elapsedTimeSeconds) * 60;
    console.log(`[${this.sensorId}] 計算されたRPM: ${rpm}`);

    // ★ 修正: 正常に計算できた場合のみ前回データを更新
    this.previousCrankData = currentCrankData;

    // 異常値をフィルタリング（0-300 RPMの範囲）
    if (rpm < 0 || rpm > 300) {
      console.log(`[${this.sensorId}] 異常値検出: ${rpm} RPM - 無視`);
      return null;
    }

    return Math.round(rpm);
  }

  /**
   * ロールオーバーを考慮した差分計算
   * @param current 現在の値
   * @param previous 前回の値
   * @param maxValue 最大値 + 1（ロールオーバー値）
   * @returns 差分
   */
  private calculateDifference(current: number, previous: number, maxValue: number): number {
    let diff = current - previous;
    
    // ロールオーバーが発生した場合の補正
    if (diff < 0) {
      diff += maxValue;
      console.log(`[${this.sensorId}] ロールオーバー補正: ${current} - ${previous} = ${diff} (補正後)`);
    }
    
    return diff;
  }

  /**
   * 計算状態をリセット
   */
  reset(): void {
    this.previousCrankData = null;
    console.log(`[${this.sensorId}] ケイデンス計算器をリセット`);
  }

  /**
   * 前回データの存在確認
   */
  hasPreviousData(): boolean {
    return this.previousCrankData !== null;
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): string {
    if (!this.previousCrankData) {
      return `[${this.sensorId}] 前回データなし`;
    }
    
    return `[${this.sensorId}] 前回データ: Rev=${this.previousCrankData.cumulativeCrankRevolutions}, Time=${this.previousCrankData.lastCrankEventTime}`;
  }
}

/**
 * センサーごとのケイデンス計算器管理クラス
 */
export class CadenceCalculatorManager {
  private calculators: Map<string, CadenceCalculator> = new Map();

  /**
   * 指定されたセンサーのケイデンス計算器を取得（存在しない場合は作成）
   */
  getCalculator(sensorId: string): CadenceCalculator {
    if (!this.calculators.has(sensorId)) {
      this.calculators.set(sensorId, new CadenceCalculator(sensorId));
      console.log(`新しいケイデンス計算器を作成: ${sensorId}`);
    }
    return this.calculators.get(sensorId)!;
  }

  /**
   * 指定されたセンサーの計算器をリセット
   */
  resetCalculator(sensorId: string): void {
    const calculator = this.calculators.get(sensorId);
    if (calculator) {
      calculator.reset();
    }
  }

  /**
   * 指定されたセンサーの計算器を削除
   */
  removeCalculator(sensorId: string): void {
    if (this.calculators.has(sensorId)) {
      this.calculators.delete(sensorId);
      console.log(`ケイデンス計算器を削除: ${sensorId}`);
    }
  }

  /**
   * すべての計算器をリセット
   */
  resetAll(): void {
    this.calculators.forEach((calculator, sensorId) => {
      calculator.reset();
    });
    console.log('すべてのケイデンス計算器をリセット');
  }

  /**
   * すべての計算器を削除
   */
  clearAll(): void {
    this.calculators.clear();
    console.log('すべてのケイデンス計算器を削除');
  }

  /**
   * 現在管理している計算器の一覧を取得
   */
  getActiveSensors(): string[] {
    return Array.from(this.calculators.keys());
  }
}

// グローバルマネージャーインスタンス
export const cadenceCalculatorManager = new CadenceCalculatorManager();
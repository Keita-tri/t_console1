/**
 * BLE Command Queue - BLE操作の安定性を向上させるためのコマンドキューシステム
 * 
 * 目的:
 * - BLE操作を順次実行し、デバイスへの負荷を軽減
 * - 操作間の適切な間隔を保証
 * - エラーハンドリングの統一化
 */

interface QueuedCommand<T = any> {
  command: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  description?: string;
}

class BLECommandQueue {
  private queue: QueuedCommand[] = [];
  private isProcessing = false;
  private readonly MIN_INTERVAL = 200; // 各コマンド間の最小待機時間(ミリ秒)
  private readonly DEVICE_INTERVAL = 500; // デバイス固有操作の間隔(ミリ秒)

  /**
   * BLE操作をキューに追加して順次実行
   * @param command 実行するBLE操作
   * @param description デバッグ用の説明（オプション）
   * @param isDeviceOperation デバイス固有操作かどうか（長い間隔が必要）
   */
  enqueue<T>(
    command: () => Promise<T>, 
    description?: string,
    isDeviceOperation: boolean = false
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        command,
        resolve,
        reject,
        description
      });

      if (!this.isProcessing) {
        this.processQueue(isDeviceOperation);
      }
    });
  }

  /**
   * キューを順次処理
   */
  private async processQueue(isDeviceOperation: boolean = false): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const queuedCommand = this.queue.shift();

    if (!queuedCommand) {
      this.isProcessing = false;
      return;
    }

    const { command, resolve, reject, description } = queuedCommand;

    try {
      if (description) {
        console.log(`[BLE Queue] Executing: ${description}`);
      }

      const result = await command();
      resolve(result);

      if (description) {
        console.log(`[BLE Queue] Completed: ${description}`);
      }
    } catch (error) {
      console.error(`[BLE Queue] Failed: ${description || 'Unknown command'}`, error);
      reject(error);
    } finally {
      // 適切な間隔を保って次のコマンドを実行
      const interval = isDeviceOperation ? this.DEVICE_INTERVAL : this.MIN_INTERVAL;
      
      setTimeout(() => {
        this.isProcessing = false;
        this.processQueue();
      }, interval);
    }
  }

  /**
   * キューの状態を取得（デバッグ用）
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * キューをクリア（緊急時用）
   */
  clearQueue(): void {
    this.queue.forEach(({ reject }) => {
      reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.isProcessing = false;
    console.log('[BLE Queue] Queue cleared');
  }
}

// グローバルキューインスタンス
const bleCommandQueue = new BLECommandQueue();

/**
 * BLE操作をキューに追加する便利関数
 */
export const enqueueBleCommand = <T>(
  command: () => Promise<T>, 
  description?: string,
  isDeviceOperation: boolean = false
): Promise<T> => {
  return bleCommandQueue.enqueue(command, description, isDeviceOperation);
};

/**
 * デバイス固有の操作（GATT接続、サービス取得など）用の便利関数
 */
export const enqueueDeviceCommand = <T>(
  command: () => Promise<T>, 
  description?: string
): Promise<T> => {
  return bleCommandQueue.enqueue(command, description, true);
};

/**
 * キューの状態を取得
 */
export const getBleQueueStatus = () => bleCommandQueue.getQueueStatus();

/**
 * キューをクリア（緊急時用）
 */
export const clearBleQueue = () => bleCommandQueue.clearQueue();

/**
 * 遅延関数（後方互換性のため残す）
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
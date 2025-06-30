/**
 * CSV Export Utilities
 * セッションデータをCSV形式でエクスポートする機能
 */

import { SensorSessionData, UserProfile, SavedSensorInfo } from '../types';
import { ValueFormatter } from './dataCalculations';

export interface ExportData {
  timestamp: number;
  athleteName: string;
  sensorName: string;
  sensorType: string;
  dataType: string;
  value: number | null;
  unit: string;
  formattedTimestamp: string;
  elapsedSeconds: number;
}

export class CSVExporter {
  /**
   * セッションデータをCSV形式でエクスポート
   */
  static exportSessionDataToCsv(
    sensorSessionData: Record<string, SensorSessionData>,
    userProfiles: Record<string, UserProfile>,
    savedSensors: Record<string, SavedSensorInfo>,
    sessionStartTime: number | null
  ): void {
    console.log('Starting CSV export...');
    console.log('Sensor session data:', sensorSessionData);
    console.log('User profiles:', userProfiles);
    console.log('Saved sensors:', savedSensors);

    if (!sessionStartTime) {
      console.warn('No session start time available');
      return;
    }

    const exportData: ExportData[] = [];

    // 各センサーのデータを処理
    Object.values(sensorSessionData).forEach(sensorData => {
      const { sensorId, sensorType, userId, timestamps, data } = sensorData;
      
      // ユーザー情報を取得
      const user = userId ? userProfiles[userId] : null;
      const athleteName = user?.name || 'Unknown Athlete';
      
      // センサー情報を取得
      const savedSensor = savedSensors[sensorId];
      const sensorName = savedSensor?.userAlias || savedSensor?.name || sensorId;
      
      console.log(`Processing sensor: ${sensorName} (${sensorType}) for athlete: ${athleteName}`);

      // 各データタイプを処理
      Object.entries(data).forEach(([dataType, values]) => {
        // ★ 修正: 生データ（rawData, flags）をスキップ
        if (dataType === 'rawData' || dataType === 'flags') {
          return;
        }
        
        if (!values || values.length === 0) return;

        // データタイプに応じた単位を決定
        const unit = this.getUnitForDataType(dataType);

        // 各タイムスタンプのデータを処理
        timestamps.forEach((timestamp, index) => {
          const value = values[index];
          if (value === null || value === undefined) return;

          const elapsedSeconds = Math.floor((timestamp - sessionStartTime) / 1000);
          const formattedTimestamp = new Date(timestamp).toISOString();

          exportData.push({
            timestamp,
            athleteName,
            sensorName,
            sensorType: ValueFormatter.formatSensorTypeName(sensorType),
            dataType: this.formatDataTypeName(dataType),
            value,
            unit,
            formattedTimestamp,
            elapsedSeconds
          });
        });
      });
    });

    console.log(`Generated ${exportData.length} data points for export`);

    if (exportData.length === 0) {
      console.warn('No data available for export');
      alert('エクスポートするデータがありません。');
      return;
    }

    // データを時系列順にソート
    exportData.sort((a, b) => a.timestamp - b.timestamp);

    // CSV文字列を生成
    const csvContent = this.generateCSVContent(exportData);
    
    // ファイル名を生成
    const fileName = this.generateFileName();
    
    // ダウンロードを実行
    this.downloadCSV(csvContent, fileName);
    
    console.log(`CSV export completed: ${fileName}`);
  }

  /**
   * データタイプに応じた単位を取得
   */
  private static getUnitForDataType(dataType: string): string {
    const unitMap: Record<string, string> = {
      'power': 'W',
      'heartRate': 'bpm',
      'value': '', // 汎用値（センサーによって異なる）
      'cadence': 'rpm',
      'coreTemperature': '°C',
      'skinTemperature': '°C',
      'smo2': '%',
      'thb': 'g/dl'
    };
    
    return unitMap[dataType] || '';
  }

  /**
   * データタイプ名をフォーマット
   */
  private static formatDataTypeName(dataType: string): string {
    const nameMap: Record<string, string> = {
      'power': 'Power',
      'heartRate': 'Heart Rate',
      'value': 'Value',
      'cadence': 'Cadence',
      'coreTemperature': 'Core Temperature',
      'skinTemperature': 'Skin Temperature',
      'smo2': 'SmO2',
      'thb': 'tHb'
    };
    
    return nameMap[dataType] || dataType;
  }

  /**
   * CSV文字列を生成
   */
  private static generateCSVContent(exportData: ExportData[]): string {
    // CSVヘッダー
    const headers = [
      'Timestamp',
      'Elapsed_Seconds',
      'Athlete_Name',
      'Sensor_Name',
      'Sensor_Type',
      'Data_Type',
      'Value',
      'Unit'
    ];

    // CSVボディ
    const rows = exportData.map(row => [
      row.formattedTimestamp,
      row.elapsedSeconds.toString(),
      this.escapeCsvValue(row.athleteName),
      this.escapeCsvValue(row.sensorName),
      this.escapeCsvValue(row.sensorType),
      this.escapeCsvValue(row.dataType),
      row.value?.toString() || '',
      this.escapeCsvValue(row.unit)
    ]);

    // ヘッダーとボディを結合
    const allRows = [headers, ...rows];
    
    return allRows.map(row => row.join(',')).join('\n');
  }

  /**
   * CSV値をエスケープ
   */
  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * ファイル名を生成
   */
  private static generateFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `training_session_${year}${month}${day}_${hours}${minutes}${seconds}.csv`;
  }

  /**
   * CSVファイルをダウンロード
   */
  private static downloadCSV(csvContent: string, fileName: string): void {
    // BOM付きUTF-8でエンコード（Excelでの文字化け防止）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリリークを防ぐためURLを解放
    URL.revokeObjectURL(url);
  }

  /**
   * エクスポート可能なデータがあるかチェック
   */
  static hasExportableData(sensorSessionData: Record<string, SensorSessionData>): boolean {
    return Object.values(sensorSessionData).some(sensorData => 
      sensorData.timestamps.length > 0 && 
      Object.values(sensorData.data).some(values => 
        values && values.length > 0 && values.some(v => v !== null)
      )
    );
  }

  /**
   * エクスポート統計情報を取得
   */
  static getExportStats(sensorSessionData: Record<string, SensorSessionData>): {
    sensorCount: number;
    dataPointCount: number;
    timeSpan: string;
  } {
    const sensors = Object.values(sensorSessionData);
    const sensorCount = sensors.length;
    
    let totalDataPoints = 0;
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    sensors.forEach(sensorData => {
      sensorData.timestamps.forEach(timestamp => {
        minTimestamp = Math.min(minTimestamp, timestamp);
        maxTimestamp = Math.max(maxTimestamp, timestamp);
      });
      
      Object.values(sensorData.data).forEach(values => {
        if (values) {
          totalDataPoints += values.filter(v => v !== null).length;
        }
      });
    });

    const timeSpan = minTimestamp !== Infinity && maxTimestamp !== -Infinity
      ? ValueFormatter.formatTime(maxTimestamp - minTimestamp)
      : '0:00';

    return {
      sensorCount,
      dataPointCount: totalDataPoints,
      timeSpan
    };
  }
}
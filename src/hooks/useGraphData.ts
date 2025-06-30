import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PanelLayout, ConnectedSensor } from '../types';
import { DATA_TYPE_CONFIGS } from '../constants/dataTypes';

// ★ 修正: formatTime関数を改善（マイナス値を防ぐ）
const formatTime = (timestamp: number, baseTime: number): string => {
  const elapsed = Math.max(0, Math.floor((timestamp - baseTime) / 1000)); // マイナス値を防ぐ
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// セッション共通データ（センサー不要）の判定
const isSessionData = (dataType: string): boolean => {
  const sessionDataTypes = [
    'elapsedTime',
    'lapCount', 
    'currentLapTime',
    'targetPower',
    'trainerStatus'
  ];
  return sessionDataTypes.includes(dataType);
};

export const useGraphData = (panel: PanelLayout) => {
  const { dataType, source, config } = panel;
  const timeWindow = config?.timeWindow || 5;
  
  // セッション共通データかセンサーデータかを判定
  const isSessionDataType = isSessionData(dataType);
  const isSensorAssigned = !!source?.sensorId;
  
  // セッション共通データの場合はセンサー割り当て不要
  const requiresSensorAssignment = !isSessionDataType && !isSensorAssigned;

  // ★ 修正: 表示オプションも含めて状態を取得
  const { 
    data, 
    timestamps, 
    sensor, 
    sessionStartTime,
    displayTitle,
    lineColor
  } = useAppStore((state) => {
    // センサーと割り当てられた選手情報を取得
    const sensor = source?.sensorId ? state.connectedSensors[source.sensorId] : undefined;
    const athlete = sensor?.assignedUserId ? state.userProfiles[sensor.assignedUserId] : undefined;

    // 1. タイトルを決定
    let title = panel.displayName || sensor?.name || DATA_TYPE_CONFIGS[dataType]?.label || 'Graph';
    if (state.dashboardDisplayOptions?.showAthleteNames && athlete) {
      title = `${athlete.name} - ${title}`;
    }

    // 2. 線の色を決定
    let color = config?.color || DATA_TYPE_CONFIGS[dataType]?.defaultColor || '#3b82f6';
    if (state.dashboardDisplayOptions?.colorCodeByAthlete && athlete) {
      color = athlete.color;
    }

    // セッション共通データの場合は統合データを使用
    if (isSessionDataType) {
      let sessionData: (number | null)[] = [];
      
      switch (dataType) {
        case 'targetPower':
          sessionData = state.sessionData.targetPower;
          break;
        default:
          sessionData = [];
      }
      
      return {
        data: sessionData,
        timestamps: state.sessionData.timestamps,
        sensor: undefined,
        sessionStartTime: state.session.startTime,
        displayTitle: title,
        lineColor: color,
      };
    }
    
    // パネルにセンサーソースが割り当てられている場合のみデータを取得
    if (source?.sensorId) {
      return {
        data: state.actions.getSensorData(source.sensorId, dataType),
        timestamps: state.actions.getSensorTimestamps(source.sensorId),
        sensor: state.connectedSensors[source.sensorId] as ConnectedSensor | undefined,
        sessionStartTime: state.session.startTime,
        displayTitle: title,
        lineColor: color,
      };
    }
    // 割り当てがない場合は空を返す
    return { 
      data: [], 
      timestamps: [], 
      sensor: undefined, 
      sessionStartTime: null,
      displayTitle: title,
      lineColor: color,
    };
  });

  const dataTypeConfig = DATA_TYPE_CONFIGS[dataType];

  // グラフ描画用のデータ加工（useMemoで計算結果をメモ化）
  const processedData = useMemo(() => {
    if (!timestamps.length || !sessionStartTime) return [];

    const now = Date.now();
    const windowStart = now - timeWindow * 60 * 1000;
    
    // ★ 修正: ベース時間の計算を改善
    // セッション開始時刻が設定されている場合はそれを使用、
    // そうでなければ最初のタイムスタンプを使用
    let baseTime = sessionStartTime;
    if (!baseTime && timestamps.length > 0) {
      baseTime = timestamps[0];
    }
    if (!baseTime) {
      baseTime = now;
    }
    
    // タイムウィンドウでフィルタリング
    return timestamps
      .map((timestamp, index) => ({
        timestamp,
        value: data[index],
        time: formatTime(timestamp, baseTime),
      }))
      .filter(item => item.timestamp >= windowStart && item.value !== null)
      .slice(-300); // パフォーマンスのため最大300点に制限
  }, [data, timestamps, sessionStartTime, timeWindow]);

  return {
    graphData: processedData,
    isSensorAssigned: !requiresSensorAssignment, // セッション共通データは常にtrue
    displayTitle,
    lineColor,
    dataTypeConfig,
  };
};
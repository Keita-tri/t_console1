import { useAppStore } from '../store/useAppStore';
import { PanelLayout, UserProfile } from '../types';
import { DATA_TYPE_CONFIGS } from '../constants/dataTypes';
import { ValueFormatter, ZoneCalculator, SensorDataCalculator } from '../utils/dataCalculations';
import { SessionStatisticsCalculator } from '../utils/sessionStatistics';
import { CalculationEngine } from '../utils/calculationUtils';

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

// 現在のラップ時間を計算
const getCurrentLapTime = (session: any): number => {
  if (session.status === 'stopped' || session.laps.length === 0) {
    return session.elapsedTime;
  }
  
  const lastLap = session.laps[session.laps.length - 1];
  const lastLapEndTime = lastLap.startTime + lastLap.duration;
  const sessionStartTime = session.startTime || Date.now();
  const currentTime = sessionStartTime + session.elapsedTime;
  
  return Math.max(0, currentTime - lastLapEndTime);
};

export const usePanelData = (panel: PanelLayout) => {
  const { dataType, source, config, displayName } = panel;
  
  // セッション共通データかセンサーデータかを判定
  const isSessionDataType = isSessionData(dataType);
  const isSensorAssigned = !!source?.sensorId;
  
  // セッション共通データの場合はセンサー割り当て不要
  const requiresSensorAssignment = !isSessionDataType && !isSensorAssigned;

  // ★ 修正: 表示オプションも含めて状態を取得
  const {
    value,
    userProfile,
    displayTitle,
    panelColor,
    textColor
  } = useAppStore((state: any) => {
    // センサーと割り当てられた選手情報を取得
    const sensor = source?.sensorId ? state.connectedSensors[source.sensorId] : undefined;
    const athlete = sensor?.assignedUserId ? state.userProfiles[sensor.assignedUserId] : undefined;
    
    // 1. タイトルを決定
    let title = displayName || DATA_TYPE_CONFIGS[dataType]?.label || dataType;
    if (state.dashboardDisplayOptions?.showAthleteNames && athlete) {
      title = `${athlete.name} - ${title}`;
    }

    // 2. 基本色を決定
    let basePanelColor = 'rgba(30, 41, 59, 0.8)'; // デフォルト背景色
    let baseTextColor = '#e2e8f0'; // デフォルトテキスト色
    
    if (state.dashboardDisplayOptions?.colorCodeByAthlete && athlete) {
      basePanelColor = `${athlete.color}20`; // 選手の色を背景に（20%透明度）
      baseTextColor = athlete.color; // 選手の色をテキストに
    }

    // セッション共通データの処理
    if (isSessionDataType) {
      let value = null;
      const userProfile = state.userProfiles.default;
      
      switch (dataType) {
        case 'elapsedTime':
          value = state.session.elapsedTime;
          break;
        case 'lapCount':
          value = state.session.laps.length;
          break;
        case 'currentLapTime':
          value = getCurrentLapTime(state.session);
          break;
        case 'targetPower':
          // トレーナーからの目標パワーを取得
          const trainer = Object.values(state.connectedTrainers)[0] as any;
          value = trainer?.status.targetPower || null;
          break;
        case 'trainerStatus':
          const trainerStatus = Object.values(state.connectedTrainers)[0] as any;
          value = trainerStatus?.status.lastResponse || '---';
          break;
        default:
          value = null;
      }
      
      return { 
        value, 
        userProfile, 
        displayTitle: title,
        panelColor: basePanelColor,
        textColor: baseTextColor
      };
    }

    // センサーデータの処理（既存のロジック）
    if (!isSensorAssigned) {
      return { 
        value: null, 
        userProfile: state.userProfiles.default,
        displayTitle: title,
        panelColor: basePanelColor,
        textColor: baseTextColor
      };
    }

    const userProfile = athlete || state.userProfiles.default;

    // ラップ統計の計算
    if (dataType.includes('lap')) {
      const statType = dataType.includes('max') ? 'max' : 
                      dataType.includes('avg') ? 'avg' : 
                      dataType.includes('min') ? 'min' : null;
      
      if (statType) {
        const baseDataType = dataType.replace(/lap|max|avg|min/gi, '').toLowerCase();
        const value = state.actions.getSensorLapStats(source!.sensorId, baseDataType, statType);
        return { 
          value, 
          userProfile,
          displayTitle: title,
          panelColor: basePanelColor,
          textColor: baseTextColor
        };
      }
    }
    
    // セッション統計の計算
    if (dataType.includes('max') || dataType.includes('avg') || dataType.includes('min')) {
      const statType = dataType.includes('max') ? 'max' : 
                      dataType.includes('avg') ? 'avg' : 'min';
      const baseDataType = dataType.replace(/max|avg|min/gi, '').toLowerCase();
      const value = state.actions.getSensorStats(source!.sensorId, baseDataType, statType);
      return { 
        value, 
        userProfile,
        displayTitle: title,
        panelColor: basePanelColor,
        textColor: baseTextColor
      };
    }
    
    // リアルタイムデータの取得
    let value = null;
    if (sensor?.data) {
      switch (dataType) {
        case 'power':
          value = sensor.data.power ?? null;
          break;
        case 'cadence':
          value = sensor.data.cadence ?? null;
          break;
        case 'heartRate':
          value = sensor.data.value ?? null;
          break;
        case 'coreTemperature':
          value = sensor.data.coreTemperature ?? null;
          break;
        case 'skinTemperature':
          value = sensor.data.skinTemperature ?? null;
          break;
        case 'smo2':
          value = sensor.data.smo2 ?? null;
          break;
        case 'thb':
          value = sensor.data.thb ?? null;
          break;
        case 'rawData':
          value = sensor.data.rawData || '--';
          break;
        case 'flags':
          value = sensor.data.flags || '--';
          break;
        default:
          value = sensor.data[dataType] ?? null;
      }
    }
    
    return { 
      value, 
      userProfile,
      displayTitle: title,
      panelColor: basePanelColor,
      textColor: baseTextColor
    };
  });
  
  // ★ 修正: userProfileが存在しない場合のデフォルト値を設定
  const defaultProfile = useAppStore((state) => state.userProfiles.default) || { 
    ftp: 250, 
    maxHr: 190, 
    color: '#3b82f6', 
    powerZones: [], 
    hrZones: [] 
  };
  
  // userProfileが存在しない場合、デフォルトのプロファイルをフォールバックとして使用
  const profile = userProfile || defaultProfile;

  const dataTypeConfig = DATA_TYPE_CONFIGS[dataType];
  
  // 時間データの特別処理
  let formattedValue: string;
  if ((dataType === 'elapsedTime' || dataType === 'currentLapTime') && typeof value === 'number') {
    formattedValue = ValueFormatter.formatTime(value);
  } else if (typeof value === 'string') {
    formattedValue = value;
  } else {
    formattedValue = ValueFormatter.formatValue(value as number, config?.precision);
  }

  const unit = dataTypeConfig?.unit || '';

  // ゾーンカラーの計算
  let zoneColor = '';
  if (typeof value === 'number' && value !== null) {
    if (dataType.includes('power') || dataType === 'normalizedPower') {
      zoneColor = ZoneCalculator.getZoneColor(value, profile.powerZones, profile.ftp);
    } else if (dataType.includes('heartRate') || dataType.includes('HeartRate')) {
      zoneColor = ZoneCalculator.getZoneColor(value, profile.hrZones, profile.maxHr);
    }
  }

  // ★ 修正: 最終的な色を決定（優先度: カスタム設定 > ゾーン色 > 選手色 > デフォルト）
  let finalPanelColor = panelColor;
  let finalTextColor = textColor;
  
  if (config?.color === 'zone' && zoneColor) {
    finalPanelColor = `${zoneColor}20`; // 20% opacity background
    finalTextColor = zoneColor;
  } else if (config?.color && config.color !== '#ffffff' && config.color !== 'zone') {
    finalPanelColor = `${config.color}20`; // 20% opacity background
    finalTextColor = config.color;
  }

  return {
    isSensorAssigned: !requiresSensorAssignment, // セッション共通データは常にtrue
    displayValue: formattedValue,
    displayTitle,
    unit,
    zoneColor,
    panelColor: finalPanelColor,
    textColor: finalTextColor,
  };
};
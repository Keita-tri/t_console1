import React, { useState } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { PanelLayout } from '../../types';
import { useGraphData } from '../../hooks/useGraphData';
import { Settings, ZoomIn, ZoomOut } from 'lucide-react';

interface GraphPanelProps {
  panel: PanelLayout;
}

const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.4);
  }
  
  transition: all 200ms ease;
`;

const GraphHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-shrink: 0;
  gap: 8px;
`;

const GraphTitle = styled.h3`
  font-size: clamp(0.8rem, 1.5vw, 1.1rem);
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
`;

const GraphControls = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 200ms ease;
  flex-shrink: 0;
  
  ${GraphContainer}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  color: #94a3b8;
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    color: #e2e8f0;
    transform: scale(1.05);
  }
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: clamp(0.75rem, 1.2vw, 0.875rem);
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const ZoneIndicator = styled.div<{ color: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 2px solid rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 10px ${({ color }) => `${color}60`};
`;

export const GraphPanel: React.FC<GraphPanelProps> = ({ panel }) => {
  const { powerZones, hrZones, userProfiles } = useAppStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  // ★ カスタムフックでロジックをすべて集約
  const { graphData, isSensorAssigned, displayTitle, lineColor, dataTypeConfig } = useGraphData(panel);
  
  const yAxisScale = panel.config?.yAxisScale;
  const showGrid = panel.config?.showGrid !== false;
  const lineWidth = panel.config?.lineWidth || 2;
  const showDataPoints = panel.config?.showDataPoints || false;
  const defaultProfile = userProfiles.default || { 
    ftp: 250, 
    maxHr: 190, 
    color: '#3b82f6', 
    powerZones: [], 
    hrZones: [] 
  };

  // センサーが割り当てられていない場合の表示
  if (!isSensorAssigned) {
    return (
      <GraphContainer>
        <GraphHeader>
          <GraphTitle>{displayTitle}</GraphTitle>
        </GraphHeader>
        <NoDataMessage>Please assign a sensor in Edit Mode</NoDataMessage>
      </GraphContainer>
    );
  }

  // データがまだない場合の表示
  if (graphData.length === 0) {
    return (
      <GraphContainer>
        <GraphHeader>
          <GraphTitle>{displayTitle}</GraphTitle>
        </GraphHeader>
        <NoDataMessage>Waiting for data...</NoDataMessage>
      </GraphContainer>
    );
  }

  const values = graphData.map(d => d.value).filter(v => v !== null) as number[];
  
  let yAxisDomain: [number, number] | ['auto', 'auto'];

  if (yAxisScale?.auto === false && yAxisScale.min !== undefined && yAxisScale.max !== undefined) {
    yAxisDomain = [yAxisScale.min, yAxisScale.max];
  } else if (values.length > 0) {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.1 || 10; 
    
    yAxisDomain = [
      Math.max(0, minValue - padding),
      maxValue + padding
    ];
  } else {
    yAxisDomain = [0, 100]; 
  }

  const currentValue = graphData[graphData.length - 1]?.value;
  let currentZoneColor = '';
  if (currentValue !== null && currentValue !== undefined) {
    if (panel.dataType.includes('power')) {
      currentZoneColor = powerZones.find(zone => currentValue <= zone.threshold * defaultProfile.ftp)?.color || '';
    } else if (panel.dataType.includes('heartRate')) {
      currentZoneColor = hrZones.find(zone => currentValue <= zone.threshold * defaultProfile.maxHr)?.color || '';
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 2, 8));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 2, 0.25));
  };

  const timeWindow = panel.config?.timeWindow || 5;

  // ★ 表示に専念するJSX
  return (
    <GraphContainer>
      <GraphHeader>
        <GraphTitle>
          {displayTitle}
          {zoomLevel !== 1 && ` (${Math.round(timeWindow / zoomLevel)}min)`}
        </GraphTitle>
        <GraphControls>
          <ControlButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={12} />
          </ControlButton>
          <ControlButton onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={12} />
          </ControlButton>
          <ControlButton onClick={() => setShowSettings(!showSettings)} title="Settings">
            <Settings size={12} />
          </ControlButton>
        </GraphControls>
      </GraphHeader>
      
      {currentZoneColor && (
        <ZoneIndicator color={currentZoneColor} title="Current Zone" />
      )}
      
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={graphData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis 
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval={Math.max(1, Math.floor(graphData.length / 10))}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={35}
              domain={yAxisDomain}
            />
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(59, 130, 246, 0.2)" 
                strokeOpacity={0.5}
              />
            )}
            <Tooltip 
              labelStyle={{ color: '#e2e8f0', fontSize: '0.75rem' }}
              contentStyle={{ 
                background: 'rgba(30, 41, 59, 0.95)', 
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                fontSize: '0.75rem',
                padding: '8px',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value: any) => [
                `${value}${dataTypeConfig?.unit || ''}`, 
                dataTypeConfig?.label || panel.dataType
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            
            {/* Zone boundary lines */}
            {panel.dataType.includes('power') && powerZones.map((zone, index) => {
              const threshold = zone.threshold * defaultProfile.ftp;
              if (threshold < (yAxisDomain as number[])[1] && threshold > (yAxisDomain as number[])[0]) {
                return (
                  <ReferenceLine 
                    key={index}
                    y={threshold} 
                    stroke={zone.color} 
                    strokeDasharray="2 2" 
                    strokeOpacity={0.6}
                  />
                );
              }
              return null;
            })}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={lineColor}
              strokeWidth={lineWidth}
              dot={showDataPoints ? { r: 2, fill: lineColor } : false}
              activeDot={{ 
                r: 3, 
                stroke: lineColor, 
                strokeWidth: 2, 
                fill: 'rgba(30, 41, 59, 0.8)' 
              }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </GraphContainer>
  );
};
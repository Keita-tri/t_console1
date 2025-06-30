import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  dataType?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ColorSwatch = styled.button<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  background-color: ${({ color }) => color};
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
`;

const ZonePreview = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

const ColorInput = styled.input`
  opacity: 0;
  position: absolute;
  pointer-events: none;
`;

const ColorText = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const PresetColors = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const PresetColor = styled.button<{ color: string; $isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid ${({ $isSelected }) => $isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)'};
  background-color: ${({ color }) => color};
  cursor: pointer;
  transition: all 200ms ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
  }
`;

const ColorModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const ColorModeLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
`;

const ColorModeSelect = styled.select`
  padding: 6px 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  option {
    background: rgba(30, 41, 59, 0.95);
    color: #e2e8f0;
  }
`;

const ZoneColorPreview = styled.div<{ zones: Array<{ color: string }> }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ zones }) => {
    if (zones.length === 0) return 'rgba(30, 41, 59, 0.8)';
    const colors = zones.map(zone => zone.color);
    const step = 100 / colors.length;
    const gradientStops = colors.map((color, index) => 
      `${color} ${index * step}%, ${color} ${(index + 1) * step}%`
    ).join(', ');
    return `linear-gradient(45deg, ${gradientStops})`;
  }};
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8', // White/Gray
  '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', // Blue
  '#10b981', '#059669', '#047857', '#065f46', // Green
  '#f59e0b', '#d97706', '#b45309', '#92400e', // Orange
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', // Red
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'  // Purple
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  dataType
}) => {
  const { powerZones, hrZones } = useAppStore();
  const [inputId] = useState(() => `color-input-${Math.random().toString(36).substr(2, 9)}`);
  const [colorMode, setColorMode] = useState<'default' | 'zone' | 'custom'>('default');

  useEffect(() => {
    if (value === 'zone') {
      setColorMode('zone');
    } else if (value === '#ffffff' || value === '#f8fafc') {
      setColorMode('default');
    } else {
      setColorMode('custom');
    }
  }, [value]);

  const handleColorClick = () => {
    document.getElementById(inputId)?.click();
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  const handleModeChange = (mode: 'default' | 'zone' | 'custom') => {
    setColorMode(mode);
    if (mode === 'default') {
      onChange('#ffffff');
    } else if (mode === 'zone') {
      onChange('zone');
    } else if (mode === 'custom' && (value === 'zone' || value === '#ffffff')) {
      onChange('#3b82f6');
    }
  };

  const displayValue = value === 'zone' ? 'Zone Color' : value;

  const isHeartRateData = dataType?.includes('heartRate') || dataType?.includes('HeartRate');
  const isPowerData = dataType?.includes('power') || dataType === 'normalizedPower';

  const getZonePreviewText = () => {
    if (isHeartRateData) return 'HR';
    if (isPowerData) return 'PWR';
    return 'ZONE';
  };

  const relevantZones = isHeartRateData ? hrZones : isPowerData ? powerZones : [];

  return (
    <Container>
      {label && <Label>{label}</Label>}
      
      <ColorModeContainer>
        <ColorModeLabel>Color Mode</ColorModeLabel>
        <ColorModeSelect
          value={colorMode}
          onChange={(e) => handleModeChange(e.target.value as 'default' | 'zone' | 'custom')}
        >
          <option value="default">Default</option>
          <option value="zone">Zone Color</option>
          <option value="custom">Custom</option>
        </ColorModeSelect>
      </ColorModeContainer>

      {colorMode === 'zone' && (
        <ColorInputContainer>
          <ColorSwatch color="transparent" onClick={() => {}}>
            <ZoneColorPreview zones={relevantZones}>
              {getZonePreviewText()}
            </ZoneColorPreview>
          </ColorSwatch>
        </ColorInputContainer>
      )}

      {colorMode === 'custom' && (
        <>
          <ColorInputContainer>
            <ColorSwatch color={value} onClick={handleColorClick} />
            <ColorText>{displayValue.toUpperCase()}</ColorText>
            <ColorInput
              id={inputId}
              type="color"
              value={value === 'zone' ? '#3b82f6' : value}
              onChange={(e) => onChange(e.target.value)}
            />
          </ColorInputContainer>
          <PresetColors>
            {PRESET_COLORS.map((color) => (
              <PresetColor
                key={color}
                color={color}
                $isSelected={value.toUpperCase() === color.toUpperCase()}
                onClick={() => handlePresetClick(color)}
              />
            ))}
          </PresetColors>
        </>
      )}

      {colorMode === 'default' && (
        <ColorInputContainer>
          <ColorSwatch color="#ffffff" onClick={() => {}} />
        </ColorInputContainer>
      )}
    </Container>
  );
};
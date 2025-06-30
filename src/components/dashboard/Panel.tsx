import React from 'react';
import styled from 'styled-components';
import { PanelLayout } from '../../types';
import { usePanelData } from '../../hooks/usePanelData';

interface PanelProps {
  panel: PanelLayout;
}

const PanelContainer = styled.div<{ $panelColor: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: ${({ $panelColor }) => $panelColor};
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-left: 4px solid ${({ $panelColor }) => $panelColor.replace('20', '80')};
  border-radius: 12px;
  transition: all 300ms ease;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  container-type: size;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.4);
  }
`;

const PanelTitle = styled.h3<{ $textColor: string }>`
  font-size: clamp(0.6rem, 2.5vw + 0.3rem, 1rem);
  font-weight: 500;
  color: ${({ $textColor }) => $textColor};
  opacity: 0.8;
  margin: 0 0 8px 0;
  text-align: center;
  line-height: 1.2;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  flex-shrink: 0;
`;

const PanelValue = styled.div<{ $textColor: string }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: clamp(1.5rem, 8vw, 6rem);
  font-weight: 700;
  color: ${({ $textColor }) => $textColor};
  line-height: 0.9;
  text-align: center;
  transition: color 300ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  text-shadow: 0 0 15px ${({ $textColor }) => `${$textColor}30`};
  letter-spacing: -0.02em;
  max-width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  
  /* パネルサイズに応じた細かいスケーリング */
  @container (min-width: 160px) {
    font-size: clamp(1.6rem, 8.5vw, 6.2rem);
  }
  
  @container (min-width: 180px) {
    font-size: clamp(1.7rem, 9vw, 6.4rem);
  }
  
  @container (min-width: 200px) {
    font-size: clamp(1.8rem, 9.5vw, 6.6rem);
  }
  
  @container (min-width: 220px) {
    font-size: clamp(1.9rem, 10vw, 6.8rem);
  }
  
  @container (min-width: 240px) {
    font-size: clamp(2rem, 10.5vw, 7rem);
  }
  
  @container (min-width: 260px) {
    font-size: clamp(2.1rem, 11vw, 7.2rem);
  }
  
  @container (min-width: 280px) {
    font-size: clamp(2.2rem, 11.5vw, 7.4rem);
  }
  
  @container (min-width: 300px) {
    font-size: clamp(2.3rem, 12vw, 7.6rem);
  }
  
  @container (min-width: 320px) {
    font-size: clamp(2.4rem, 12.5vw, 7.8rem);
  }
  
  @container (min-width: 340px) {
    font-size: clamp(2.5rem, 13vw, 8rem);
  }
  
  @container (min-width: 360px) {
    font-size: clamp(2.6rem, 13.5vw, 8.2rem);
  }
  
  @container (min-width: 380px) {
    font-size: clamp(2.7rem, 14vw, 8.4rem);
  }
  
  @container (min-width: 400px) {
    font-size: clamp(2.8rem, 14.5vw, 8.6rem);
  }
  
  @container (min-width: 450px) {
    font-size: clamp(3.2rem, 15vw, 9.5rem);
  }
  
  @container (min-width: 500px) {
    font-size: clamp(3.6rem, 16vw, 10.5rem);
  }
  
  @container (min-width: 550px) {
    font-size: clamp(4rem, 17vw, 11.5rem);
  }
  
  @container (min-width: 600px) {
    font-size: clamp(4.5rem, 18vw, 12.5rem);
  }
  
  @container (min-width: 700px) {
    font-size: clamp(5.5rem, 20vw, 15rem);
  }
  
  /* 高さが小さい場合の調整 */
  @container (max-height: 120px) {
    font-size: clamp(0.9rem, 4vw, 2rem);
  }
  
  @container (max-height: 150px) {
    font-size: clamp(1rem, 5vw, 2.5rem);
  }
  
  @container (max-height: 200px) {
    font-size: clamp(1.2rem, 6vw, 3rem);
  }
`;

const PanelUnit = styled.span`
  font-size: clamp(0.7rem, 2.5vw, 1.5rem);
  font-weight: 500;
  margin-left: 6px;
  opacity: 0.7;
  letter-spacing: 0.025em;
  flex-shrink: 0;
  
  /* パネルサイズに応じた単位のスケーリング */
  @container (min-width: 200px) {
    font-size: clamp(0.8rem, 2.8vw, 1.6rem);
  }
  
  @container (min-width: 240px) {
    font-size: clamp(0.9rem, 3vw, 1.7rem);
  }
  
  @container (min-width: 280px) {
    font-size: clamp(1rem, 3.2vw, 1.8rem);
  }
  
  @container (min-width: 320px) {
    font-size: clamp(1.1rem, 3.4vw, 1.9rem);
  }
  
  @container (min-width: 360px) {
    font-size: clamp(1.2rem, 3.6vw, 2rem);
  }
  
  @container (min-width: 400px) {
    font-size: clamp(1.3rem, 3.8vw, 2.2rem);
  }
  
  @container (min-width: 500px) {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }
  
  @container (min-width: 600px) {
    font-size: clamp(1.8rem, 4.5vw, 3rem);
  }
`;

const NoDataMessage = styled.div`
  color: #94a3b8;
  font-size: clamp(0.8rem, 2.5vw, 1.2rem);
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.025em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.3;
`;

export const Panel: React.FC<PanelProps> = ({ panel }) => {
  // ★ カスタムフックでロジックをすべて集約
  const { 
    isSensorAssigned, 
    displayValue, 
    displayTitle, 
    unit, 
    panelColor, 
    textColor 
  } = usePanelData(panel);

  // センサーが割り当てられていない場合の表示
  if (!isSensorAssigned) {
    return (
      <PanelContainer $panelColor="rgba(30, 41, 59, 0.8)">
        <PanelTitle $textColor="#94a3b8">{displayTitle}</PanelTitle>
        <NoDataMessage>Assign Sensor</NoDataMessage>
      </PanelContainer>
    );
  }

  // ★ 表示に専念するJSX
  return (
    <PanelContainer $panelColor={panelColor}>
      <PanelTitle $textColor="#94a3b8">{displayTitle}</PanelTitle>
      <PanelValue $textColor={textColor}>
        {displayValue}
        {unit && typeof displayValue === 'string' && displayValue !== '--' && (
          <PanelUnit>{unit}</PanelUnit>
        )}
      </PanelValue>
    </PanelContainer>
  );
};
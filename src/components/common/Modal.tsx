import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Overlay = styled.div`
  /* 完全なビューポート基準の配置 */
  position: fixed;
  inset: 0;
  
  /* ビューポート全体を確実にカバー */
  width: 100vw;
  height: 100vh;
  
  /* 最高優先度のz-index */
  z-index: 99999;
  
  /* 背景とブラー効果 - 透明度を上げて背景をより見えるように */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  
  /* 完全な中央配置 */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* マージン・パディングの完全リセット */
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  
  /* スクロール対応 */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  
  /* 他の要素からの影響を排除 */
  isolation: isolate;
  
  /* ポインターイベントを確実に受け取る */
  pointer-events: auto;
`;

const ModalContainer = styled.div<{ $size: string }>`
  /* モーダル本体のスタイル */
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  /* レスポンシブ幅 */
  width: 100%;
  max-width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '400px';
      case 'large': return '800px';
      default: return '600px';
    }
  }};
  
  /* レイアウト */
  display: flex;
  flex-direction: column;
  
  /* 高さ制限 */
  max-height: calc(100vh - 40px);
  min-height: 200px;
  
  /* 縮小防止 */
  flex-shrink: 0;
  
  /* モバイル対応 */
  @media (max-width: 768px) {
    max-width: calc(100vw - 40px);
  }
  
  /* 位置の強制リセット */
  position: relative;
  margin: 0 auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  flex-shrink: 0;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 200ms ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
    transform: scale(1.05);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  color: #e2e8f0;
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // ページスクロールを完全に無効化
      const originalStyle = window.getComputedStyle(document.body);
      const scrollY = window.scrollY;
      
      // body要素のスクロールを完全に固定
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // ESCキーでの閉じる機能
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        // スタイルを元に戻す
        document.body.style.position = originalStyle.position;
        document.body.style.top = originalStyle.top;
        document.body.style.left = originalStyle.left;
        document.body.style.right = originalStyle.right;
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.width = originalStyle.width;
        document.body.style.height = originalStyle.height;
        
        // スクロール位置を復元
        window.scrollTo(0, scrollY);
        
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // オーバーレイ自体がクリックされた場合のみ閉じる
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <Overlay ref={overlayRef} onClick={handleOverlayClick}>
      <ModalContainer $size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );

  // Portalを使ってbody直下にレンダリング
  return createPortal(modalContent, document.body);
};
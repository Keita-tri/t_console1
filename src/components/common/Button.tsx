import React from 'react';
import styled, { css } from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: 1px solid rgba(59, 130, 246, 0.3);
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          border-color: rgba(59, 130, 246, 0.5);
        }
      `;
    case 'secondary':
      return css`
        background: rgba(30, 41, 59, 0.8);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.3);
        backdrop-filter: blur(10px);
        
        &:hover:not(:disabled) {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(148, 163, 184, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `;
    case 'danger':
      return css`
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: 1px solid rgba(239, 68, 68, 0.3);
        box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3);
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
          border-color: rgba(239, 68, 68, 0.5);
        }
      `;
    default:
      return css``;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'small':
      return css`
        padding: 6px 12px;
        font-size: 0.875rem;
      `;
    case 'large':
      return css`
        padding: 12px 24px;
        font-size: 1.125rem;
      `;
    default:
      return css`
        padding: 8px 16px;
        font-size: 1rem;
      `;
  }
};

const StyledButton = styled.button<{ variant: string; size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  /* Subtle glow effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  className
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon && icon}
      {children}
    </StyledButton>
  );
};
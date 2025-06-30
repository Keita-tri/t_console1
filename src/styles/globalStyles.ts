import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    color: #e2e8f0;
    height: 100%;
    overflow-x: hidden;
  }

  #root {
    height: 100%;
    overflow-x: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* Toast notifications - 最高のz-indexでモーダルの上に表示 */
  .Toastify__toast-container {
    z-index: 1000000 !important;
  }
  
  .Toastify__toast {
    z-index: 1000001 !important;
  }

  .react-grid-layout {
    position: relative;
  }

  .react-grid-item {
    transition: all 200ms ease;
    border-radius: 12px;
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(59, 130, 246, 0.2);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    pointer-events: auto;
  }

  .react-grid-item:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  .react-grid-item.cssTransforms {
    transition-property: transform, width, height;
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjNTk3M0ZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTYgNkgwVjBoNnY2eiIvPgo8L3N2Zz4K');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
    z-index: 50;
    opacity: 0.6;
    transition: opacity 200ms ease;
  }

  .react-grid-item:hover > .react-resizable-handle {
    opacity: 1;
  }

  /* Edit buttons styling */
  .panel-action-button {
    z-index: 100 !important;
    pointer-events: auto !important;
  }
  /* Loading animation */
  .loading-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Dark scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.6);
    border-radius: 4px;
    transition: background 200ms ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.8);
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.6) rgba(30, 41, 59, 0.5);
  }

  /* Modal body scroll lock */
  body.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }

  /* Selection styling */
  ::selection {
    background: rgba(59, 130, 246, 0.3);
    color: #e2e8f0;
  }

  /* Focus outline */
  *:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  /* Smooth transitions for all interactive elements */
  button, input, select, textarea {
    transition: all 200ms ease;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const Header = styled.header`
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 16px 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const MainContent = styled.main`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  min-height: calc(100vh - 140px);
  overflow: visible;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

export const BlankState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  padding: 40px;
  color: #94a3b8;
`;

export const BlankStateTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e2e8f0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const BlankStateDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 24px;
  max-width: 400px;
  color: #94a3b8;
`;
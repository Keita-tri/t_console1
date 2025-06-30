import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Redux Provider is now in App.tsx, so no direct need for Provider/store here if App is the root component rendered.
// However, if store was needed for other setup outside of App, it could be imported.

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

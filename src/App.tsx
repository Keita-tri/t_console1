import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/layout/MainLayout'; // Ensure this path is correct

function App() {
  return (
    <Provider store={store}>
      <MainLayout />
    </Provider>
  );
}

export default App;

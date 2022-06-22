import React from 'react';
import App from './App';

import { MainProvider } from './contexts/MainContext';

function MainApp() {
  // console.log('Main App js render');
  return (
    <MainProvider>
      <App />
    </MainProvider>
  );
}

export default MainApp;
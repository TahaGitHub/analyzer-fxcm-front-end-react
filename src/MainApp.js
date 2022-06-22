import React from 'react';
import { BrowserRouter } from "react-router-dom";

import App from './App';

import { MainProvider } from './contexts/MainContext';

function MainApp() {
  // console.log('Main App js render');
  return (
    <BrowserRouter basename="/projects/analyzer">
      <MainProvider>
        <App />
      </MainProvider>
    </BrowserRouter>
  );
}

export default MainApp;
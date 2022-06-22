import React, { useEffect, useState } from 'react';

import './App.scss';

import Home from './pages/home/Home';
import { authenticate } from './socketConfig/FxcmConnection';

function App() {
  const [connected, setconnected] = useState(false);

  useEffect(() => {
    authenticate().then((res) => {
      // console.log('Socket authenticate ', res)
      if (res === true) {
        setconnected(e => true);
      }
    });
  }, []);

  // console.log('App js render');
  return (
    <div className="App">
      <header className="App-header">
        <span>Currency Prediction Project</span>
      </header>
      
      <div className='App-body'>
        {connected ?
          <Home />
          :
          <div className='msg'>Connecting to FXCM Trading Station Web...</div>
        }
      </div>
    </div>
  );
}

export default App;
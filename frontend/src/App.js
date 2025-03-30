import React, { useState, useEffect } from 'react';
import './App.css';

import LoginForm from './LoginForm';
import StartGame from './StartGame';
import Cookies from 'js-cookie';


import ComponentHost from './ComponentHost';
import ComponentPlayer from './ComponentPlayer';

const DEBUG_SERVER = false;

function App() {
  const [activeTab, setActiveTab] = useState('prepare');
  const [isPlayer, setIsPlayer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setDataBasedOnToken = () => {
    const token = Cookies.get('authToken');
    const sessionToken = sessionStorage.getItem('authToken');
    if (token && token === sessionToken) {
      if (token.startsWith('player') || token.startsWith('transient')) {
        setIsPlayer(true);
        setActiveTab('player');
      } else {
        setIsPlayer(false);
        setActiveTab('host');
      }
      setIsAuthenticated(true);
    }
  }

  useEffect(() => {
    setDataBasedOnToken();

  }, []);

  const handleLogin = () => {
    setDataBasedOnToken();

  };
  if (!isAuthenticated) {
    const urlParams = new URLSearchParams(window.location.search);
    if (DEBUG_SERVER || urlParams.get('debug')) {
      return <StartGame />;
    } else {
      return <LoginForm onLogin={handleLogin} />;
    }
  }

  return (
    <div className="App">
      <header className="App-header">

        {/* <div>
         <button onClick={() => setActiveTab('host')}>Host Interface</button>
         <button onClick={() => setActiveTab('player')}>Player Interface</button>
       </div> */}
        {!isPlayer && activeTab === 'host' && <ComponentHost />}
        {isPlayer && activeTab === 'player' && <ComponentPlayer />}

      </header>
    </div>
  );
}

export default App;

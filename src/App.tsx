import CircularProgress from '@material-ui/core/CircularProgress'
import React, { useState, useEffect } from 'react'
import connectSafe from './utils/safe'
import buildServices from './utils/services'
import logo from './logo.svg'
import './App.css'
import Dashboard from './components/Dashboard'

const App = () => {
  const [safe] = useState(connectSafe());
  const [services] = useState(buildServices(safe));
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    safe.activate(() => {
      setConnected(safe.isConnected())
    })
  
    return () => safe.deactivate();
  }, [safe]);
  return (
    <div className="App">
      {(connected ? <Dashboard safe={safe} services={services} /> : 
        <>
          Loading...<br />
          <CircularProgress />
        </>
      )}
    </div>
  )
}

export default App

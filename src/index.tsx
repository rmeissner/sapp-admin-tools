import CircularProgress from '@material-ui/core/CircularProgress'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import SafeProvider from './utils/SafeProvider';
import DependenciesProvider from './utils/AppDependencies';

ReactDOM.render(
  <React.StrictMode>
    <SafeProvider loading={(
        <>
          Loading...<br />
          <CircularProgress />
        </>
      )}>
        <DependenciesProvider>
          <App />
        </DependenciesProvider>
    </SafeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

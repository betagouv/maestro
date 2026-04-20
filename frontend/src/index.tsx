import { registerSW } from 'virtual:pwa-register';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App';
import './i18n';
import * as Sentry from '@sentry/react';
import config from './utils/config';

// Vérifie qu'il n'y a pas une nouvelle version du site toutes les 5min
const intervalMS = 5 * 60 * 1000;
registerSW({
  immediate: true,
  onRegisteredSW(_s, r) {
    if (r !== undefined) {
      setInterval(() => {
        r.update();
      }, intervalMS);
    }
  }
});

Sentry.init({
  dsn: config.sentryDns,
  sendDefaultPii: true
});

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!, {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack);
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler()
});
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

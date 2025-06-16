import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './i18n';

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

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

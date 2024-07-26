import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as serviceWorker from '../public/serviceWorker';
import App from './App';
import './i18n';

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

serviceWorker.register();

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../../public/css/style.css';
import '../../public/css/animations.css';
import '../../public/css/responsive.css';
import './app.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
/**
 * Samsara My Account React App
 * Entry point for the React dashboard
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/input.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('samsara-my-account-root');

  if (rootElement) {
    // Use React 18 createRoot API
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Samsara My Account: Root element #samsara-my-account-root not found');
  }
});

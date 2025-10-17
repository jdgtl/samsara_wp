/**
 * Samsara My Account React App
 * Entry point for the React dashboard
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/input.css';

// Mount the app
const rootElement = document.getElementById('samsara-my-account-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

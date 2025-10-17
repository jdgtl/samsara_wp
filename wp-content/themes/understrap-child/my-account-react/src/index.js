/**
 * Samsara My Account React App
 * Entry point for the React dashboard
 */

import { createRoot } from 'react-dom/client';
import './styles/input.css';

// Temporary test component
function App() {
  return (
    <div className="p-8 bg-emerald-50">
      <h1 className="text-3xl font-bold text-emerald-600">
        Samsara My Account - React App Loading Successfully!
      </h1>
      <p className="mt-4 text-stone-700">
        Build system is working. Ready for component development.
      </p>
    </div>
  );
}

// Mount the app
const rootElement = document.getElementById('samsara-my-account-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

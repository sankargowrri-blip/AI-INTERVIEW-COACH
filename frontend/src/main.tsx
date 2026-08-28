import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('App is starting...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Failed to find root element');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('App rendered successfully');
} catch (error) {
  console.error('Crash during initial render:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crash</h1><pre>${error}</pre></div>`;
  }
}

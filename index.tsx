
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // We use an absolute URL relative to the current window location to ensure 
    // the Service Worker is registered on the correct origin, especially in preview environments.
    const swUrl = new URL('./sw.js', window.location.href).href;
    
    navigator.serviceWorker.register(swUrl)
      .then(reg => console.log('Service Worker registered successfully', reg.scope))
      .catch(err => {
        // In sandboxed environments like AI Studio, Service Workers are often blocked by the browser.
        // We log it as a warning instead of an error to keep the production console clean if it fails due to environment restrictions.
        if (err.name === 'SecurityError' || err.message.includes('origin')) {
          console.warn('Service Worker registration skipped: Running in a sandboxed or cross-origin environment.');
        } else {
          console.error('Service Worker registration failed:', err);
        }
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

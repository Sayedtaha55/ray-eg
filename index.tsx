import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';
import './i18n';
import ErrorBoundary from './components/common/feedback/ErrorBoundary';
import { ToastProvider } from './components/common/feedback/Toaster';
import { registerSW } from 'virtual:pwa-register';
import { syncService } from './lib/sync-service';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  syncService.startAutoSync();
} catch {
}

try {
  registerSW({
    immediate: true,
  });
} catch {
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

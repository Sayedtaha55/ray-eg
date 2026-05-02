import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './shared/i18n';
import ErrorBoundary from './shared/components/common/feedback/ErrorBoundary';
import { ToastProvider } from './shared/components/common/feedback/Toaster';
import { registerSW } from 'virtual:pwa-register';
import { syncService } from './shared/lib/sync-service';

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

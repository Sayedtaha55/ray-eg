import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@/i18n';
import ErrorBoundary from '@/components/common/feedback/ErrorBoundary';
import { ToastProvider } from '@/components/common/feedback/Toaster';
import { syncService } from '@/lib/sync-service';
import { initDB } from '@/lib/offline-db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize offline database and sync service
const initOfflineSupport = async () => {
  try {
    await initDB();
    await syncService.startAutoSync();
    console.log('Offline support initialized');
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  } catch (error) {
    console.error('Failed to initialize offline support:', error);
  }
};

initOfflineSupport();

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

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';
import { BackendStatusBanner, ErrorBoundary, ToastProvider } from './components';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BackendStatusBanner />
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

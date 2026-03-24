import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';
import ErrorBoundary from './components/common/feedback/ErrorBoundary';
import { ToastProvider } from './components/common/feedback/Toaster';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
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

try {
  if ('serviceWorker' in navigator) {
    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs.map(async (r) => {
            try {
              const url = String((r.active as any)?.scriptURL || (r.installing as any)?.scriptURL || (r.waiting as any)?.scriptURL || '');
              if (url && url.includes('/sw.js')) {
                await r.unregister();
              }
            } catch {
            }
          }),
        );
      } catch {
      }

      try {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          try {
            window.location.reload();
          } catch {
          }
        });

        const tick = async () => {
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (!reg) return;
            try {
              await reg.update();
            } catch {
            }
          } catch {
          }
        };

        await tick();
        setInterval(() => {
          void tick();
        }, 60 * 1000);
      } catch {
      }
    })();
  }
} catch {
}

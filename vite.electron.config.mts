import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendTarget = String(env.VITE_BACKEND_URL || 'http://127.0.0.1:4000').trim();
  return {
    base: './',
    server: {
      port: Number(env.VITE_PORT || env.PORT || 5174),
      host: env.VITE_HOST || '0.0.0.0',
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      {
        name: 'remove-heavy-optional-preload',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(html: string) {
            return html.replace(
              /<link rel="modulepreload"[^>]*heavy-optional[^>]*>/g,
              '',
            );
          },
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'packages/shared/src'),
        '@core': path.resolve(__dirname, './src/core'),
        '@features': path.resolve(__dirname, './src/features'),
        '@assets': path.resolve(__dirname, './src/assets'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
              return 'vendor';
            }
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) {
              return 'router';
            }
            if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
              return 'i18n';
            }
            if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/motion-dom/') || id.includes('node_modules/motion-utils/')) {
              return 'motion';
            }
            if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
              return 'charts';
            }
            if (id.includes('node_modules/leaflet/')) {
              return 'maps';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'icons';
            }
            if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/') || id.includes('node_modules/@mediapipe/') || id.includes('node_modules/hls.js/')) {
              return 'heavy-optional';
            }
            return null;
          },
        },
      },
      chunkSizeWarningLimit: 250,
      minify: 'esbuild',
      sourcemap: mode !== 'production',
    },
  };
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendTarget = String(env.VITE_BACKEND_URL || 'http://127.0.0.1:4000').trim();
  return {
    server: {
      port: Number(env.VITE_PORT || env.PORT || 5174),
      host: env.VITE_HOST || '0.0.0.0',
      hmr: {
        protocol: 'ws',
        host: env.VITE_HMR_HOST || 'localhost',
        port: Number(env.VITE_PORT || env.PORT || 5174),
      },
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/dev-dist/**',
          '**/backend/**',
          '**/prisma/**',
          '**/docs/**',
          '**/uploads/**',
          '**/logs/**',
        ],
      },
    },
    plugins: [
      react(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        filter: /\.(js|css|html|json|svg|ico)$/,
      }),
      {
        name: 'remove-heavy-optional-preload',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            // Remove modulepreload for heavy-optional chunk from initial HTML
            return html.replace(
              /<link rel="modulepreload"[^>]*heavy-optional[^>]*>/g,
              '',
            );
          },
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        filename: 'pwa-sw.js',
        devOptions: { enabled: false },
        includeAssets: [
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'icon-192x192.png',
          'icon-512x512.png',
          'brand/logo.png',
          'offline.html',
          'courier-manifest.json',
        ],
        manifest: {
          name: 'من مكانك - MNMKNK',
          short_name: 'من مكانك',
          id: '/app',
          description: 'منصة لاكتشاف أفضل المحلات والمطاعم القريبة منك مع العروض والتقييمات',
          start_url: '/',
          display: 'standalone',
          lang: 'ar',
          dir: 'rtl',
          icons: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/shared'),
        '@core': path.resolve(__dirname, './src/core'),
        '@features': path.resolve(__dirname, './src/features'),
        '@assets': path.resolve(__dirname, './src/assets'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core vendor (react/react-dom) — always needed
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
              return 'vendor';
            }
            // Router — needed on most pages
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) {
              return 'router';
            }
            // i18n — needed early but not on every page init
            if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
              return 'i18n';
            }
            // Heavy libs — NEVER in initial chunk, split by feature
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
            return null; // Let Rollup decide
          },
        },
      },
      chunkSizeWarningLimit: 250,
      minify: 'esbuild',
      sourcemap: mode !== 'production',
    },
  };
});

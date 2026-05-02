import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: Number(env.VITE_PORT || env.PORT || 5174),
      host: env.VITE_HOST || '0.0.0.0',
      hmr: {
        protocol: 'ws',
        host: env.VITE_HMR_HOST || 'localhost',
        port: Number(env.VITE_PORT || env.PORT || 5174),
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
        '@': path.resolve(__dirname, './src/shared'),
        '@core': path.resolve(__dirname, './src/core'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@assets': path.resolve(__dirname, './src/assets'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
            charts: ['recharts'],
            maps: ['leaflet'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
      minify: 'esbuild',
      sourcemap: mode !== 'production',
    },
  };
});

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
        devOptions: {
          enabled: false,
        },
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
          display_override: ['standalone', 'minimal-ui', 'browser'],
          background_color: '#ffffff',
          theme_color: '#00E5FF',
          orientation: 'portrait-primary',
          scope: '/',
          lang: 'ar',
          dir: 'rtl',
          categories: ['shopping', 'food', 'lifestyle'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
          shortcuts: [
            {
              name: 'المحلات',
              short_name: 'المحلات',
              description: 'استكشف المحلات القريبة',
              url: '/shops',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'المطاعم',
              short_name: 'المطاعم',
              description: 'اطلب من أفضل المطاعم',
              url: '/restaurants',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'الخريطة',
              short_name: 'الخريطة',
              description: 'عرض المحلات على الخريطة',
              url: '/map',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 10, // Increased for slow networks
                expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets',
                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: { maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: /^https?:\/\/.*\/api\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 8,
                expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 }, // 5 minutes for API cache
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});

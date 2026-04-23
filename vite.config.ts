import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';
    return {
      server: {
        port: Number(env.VITE_PORT || env.PORT || 5174),
        host: env.VITE_HOST || '0.0.0.0',
      },
      plugins: [
        react(),
        // Gzip compression for static assets
        viteCompression({
          algorithm: 'gzip',
          threshold: 1024,
          deleteOriginFile: false,
        }),
        // Brotli compression (better ratio)
        viteCompression({
          algorithm: 'brotliCompress',
          threshold: 1024,
          deleteOriginFile: false,
        }),
        // Bundle visualizer (only in analyze mode)
        isProd && visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
      ].filter(Boolean),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // 3D / Three.js ecosystem — separate heavy chunk
                if (id.includes('three') || id.includes('@react-three') || id.includes('drei')) return '3d';
                if (id.includes('lucide-react')) return 'ui-icons';
                if (id.includes('framer-motion')) return 'ui-anim';
                if (id.includes('recharts')) return 'charts';
                if (id.includes('leaflet')) return 'maps';
                if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
                if (id.includes('react-router')) return 'router';
                if (id.includes('react-dom')) return 'react-vendor';
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 600,
        // Keep default minifier to match Vite 7 typing/runtime expectations
        minify: 'esbuild',
        // Enable code splitting
        sourcemap: mode !== 'production',
      },
      esbuild: mode === 'production'
        ? {
            drop: ['console', 'debugger'],
          }
        : undefined,
      // Performance optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
      },
      define: {
        // Enable service worker in production
        'process.env.NODE_ENV': JSON.stringify(mode),
      }
    };
});

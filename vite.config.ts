import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: Number(env.VITE_PORT || env.PORT || 5173),
        host: env.VITE_HOST || '0.0.0.0',
      },
      plugins: [react()],
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
              maps: ['leaflet']
            }
          }
        },
        chunkSizeWarningLimit: 600,
        // Performance optimizations
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          },
        },
        // Enable code splitting
        sourcemap: mode !== 'production',
      },
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

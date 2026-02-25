import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: Number(env.VITE_PORT || env.PORT || 5174),
        host: env.VITE_HOST || '0.0.0.0',
      },
      plugins: [react()],
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
                if (id.includes('lucide-react')) return 'ui-icons';
                if (id.includes('framer-motion')) return 'ui-anim';
                if (id.includes('recharts')) return 'charts';
                if (id.includes('leaflet')) return 'maps';
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

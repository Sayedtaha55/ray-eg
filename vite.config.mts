import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
              maps: ['leaflet'],
            }
          }
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

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const certPath = path.resolve(rootDir, 'certs/localhost.pem');
const keyPath = path.resolve(rootDir, 'certs/localhost-key.pem');
const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendTarget = String(env.VITE_BACKEND_URL || 'http://127.0.0.1:4000').trim();
  return {
    root: __dirname,
    base: '/',
    publicDir: path.resolve(__dirname, 'public'),
    server: {
      port: Number(env.VITE_PORT || 3000),
      host: env.VITE_HOST || '0.0.0.0',
      https: useHttps ? { cert: certPath, key: keyPath } : undefined,
      proxy: {
        '/api': { target: backendTarget, changeOrigin: true, secure: false },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'packages/shared/src'),
        '@core': path.resolve(__dirname, './src/core'),
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) return 'vendor';
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) return 'router';
            if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) return 'i18n';
            if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/motion-dom/') || id.includes('node_modules/motion-utils/')) return 'motion';
            if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) return 'charts';
            if (id.includes('node_modules/lucide-react/')) return 'icons';
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

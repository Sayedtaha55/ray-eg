import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to NestJS backend
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // Allow images from Cloudflare R2 and other external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cfarg.com' },
      { protocol: 'https', hostname: 'api.mnmknk.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },

  // Transpile packages that need it
  transpilePackages: ['@radix-ui/react-dialog', 'socket.io-client'],

  // React 19 is already used — no need for experimental flags
  reactStrictMode: true,

  // Monorepo: trace files from repo root (not apps/web/)
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
};

export default nextConfig;

/**
 * Configuration Service - Secure Environment Variables Management
 */

 const getEnv = (key: string): string | undefined => {
   try {
     const metaEnv = (import.meta as any)?.env;
     if (metaEnv && metaEnv[key] !== undefined) return String(metaEnv[key]);
   } catch {
     // ignore
   }
 
   try {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const nodeEnv = (globalThis as any)?.process?.env;
     if (nodeEnv && nodeEnv[key] !== undefined) return String(nodeEnv[key]);
   } catch {
     // ignore
   }
 
   return undefined;
 };

export const config = {
  // Database
  database: {
    url: getEnv('DATABASE_URL') || '',
  },

  // JWT
  jwt: {
    secret: getEnv('JWT_SECRET') || 'fallback-secret-change-in-production',
    expiresIn: getEnv('JWT_EXPIRES_IN') || '15m',
  },

  // API
  api: {
    baseUrl: getEnv('API_BASE_URL') || 'http://localhost:3000',
    frontendUrl: getEnv('FRONTEND_URL') || 'http://localhost:3000',
  },

  // Security
  security: {
    corsOrigin: getEnv('CORS_ORIGIN') || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS') || '900000'),
    rateLimitMaxRequests: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS') || '100'),
  },

  // Database URL for Prisma
  databaseUrl: getEnv('DATABASE_URL') || '',

  // Gemini API
  geminiApiKey: getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY') || '',

  // Environment
  isDevelopment:
    getEnv('DEV') === 'true' ||
    getEnv('MODE') === 'development' ||
    getEnv('NODE_ENV') === 'development',
  isProduction:
    getEnv('PROD') === 'true' ||
    getEnv('MODE') === 'production' ||
    getEnv('NODE_ENV') === 'production',
};

// Validation
export const validateConfig = () => {
  const requiredVars = [
    'DATABASE_URL',
  ];

  const missing = requiredVars.filter(key => !getEnv(key));
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.warn('⚠️ Running in development mode with fallback values');
    }
  }

  // Validate JWT secret strength
  if (config.jwt.secret.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long');
  }

  return true;
};

export default config;

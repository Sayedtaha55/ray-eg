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

  return undefined;
};

export const config = {
  // API
  api: {
    baseUrl: getEnv('VITE_BACKEND_URL') || getEnv('VITE_API_BASE_URL') || 'http://127.0.0.1:4000',
  },

  // Gemini API
  geminiApiKey: getEnv('VITE_GEMINI_API_KEY') || '',

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
  const requiredVars: string[] = [];

  const missing = requiredVars.filter(key => !getEnv(key));
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      console.warn('⚠️ Running in development mode with fallback values');
    }
  }

  return true;
};

export default config;

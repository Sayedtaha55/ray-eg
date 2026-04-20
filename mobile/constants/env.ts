export const ENV = {
  API_BASE_URL: __DEV__
    ? 'http://127.0.0.1:4000'
    : 'https://ray-eg-production.up.railway.app',
} as const;

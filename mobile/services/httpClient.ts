import axios from 'axios';
import { ENV } from '@/constants/env';
import { getAccessToken, clearSession } from './authStorage';

const httpClient = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await clearSession();
    }
    return Promise.reject(error);
  },
);

export default httpClient;

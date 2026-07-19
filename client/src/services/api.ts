import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { apiGatewayUrl, apiTimeout } from 'config/env';

/**
 * Reusable Axios instance configured for Catalyst backend interactions.
 * Automatically includes Catalyst session cookies (withCredentials: true).
 * Does not implement any custom JWT interceptors or attach manual Authorization headers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiGatewayUrl,
  timeout: apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type { AxiosError, AxiosRequestConfig };
export default apiClient;

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { apiBaseUrl, apiTimeout } from 'config/env';
import { handleForbidden, handleUnauthorized } from 'utils/sessionLifecycle';

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      handleUnauthorized();
    } else if (status === 403) {
      handleForbidden();
    }
    return Promise.reject(error);
  }
);

export type { AxiosError, AxiosRequestConfig };
export default apiClient;

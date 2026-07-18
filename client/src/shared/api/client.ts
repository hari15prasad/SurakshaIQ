import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { apiGatewayUrl, apiTimeout } from 'config/env';
import { ProblemDetail, parseProblemDetail } from './pagination';

export interface ApiError extends ProblemDetail {
  message: string;
}

let onUnauthorized: (() => void) | null = null;
let onForbidden: (() => void) | null = null;

export function setAuthHandlers(handlers: {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}): void {
  onUnauthorized = handlers.onUnauthorized ?? null;
  onForbidden = handlers.onForbidden ?? null;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: apiGatewayUrl,
  timeout: apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as Partial<ProblemDetail> | undefined;

    if (status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      if (onForbidden) {
        onForbidden();
      } else {
        window.location.href = '/forbidden';
      }
    }

    const apiError: ApiError = {
      type: responseData?.type || 'about:blank',
      title: responseData?.title || 'Request failed',
      status: status || 0,
      detail: responseData?.detail || error.message,
      instance: responseData?.instance,
      errors: responseData?.errors,
      message: responseData?.detail || responseData?.title || error.message || 'An error occurred',
    };

    return Promise.reject(apiError);
  }
);

export type { AxiosRequestConfig };
export { apiClient, parseProblemDetail };
export default apiClient;

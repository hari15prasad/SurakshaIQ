import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider, useAuth } from 'shared/auth';
import type { AxiosError } from 'services/api';

function QueryProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const queryClient = useMemo(() => {
    const handleError = (error: unknown) => {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        void logout();
        navigate('/login', { replace: true });
      } else if (axiosError.response?.status === 403) {
        navigate('/forbidden', { replace: true });
      }
    };

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
          retry: (failureCount, error) => {
            const status = (error as unknown as AxiosError).response?.status;
            if (status === 401 || status === 403) return false;
            return failureCount < 1;
          },
        },
      },
      queryCache: new QueryCache({ onError: handleError }),
      mutationCache: new MutationCache({ onError: handleError }),
    });
  }, [logout, navigate]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export const RouterProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

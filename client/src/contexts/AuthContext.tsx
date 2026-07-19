import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from 'services/auth.service';
import { Officer } from 'shared/auth/types';

export interface AuthContextValue {
  user: Officer | null;
  loading: boolean;
  login: (elementId: string, redirectUrl?: string) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Officer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Detect Catalyst session using SDK
      await authService.getCurrentUser();
      
      // 2. Verify with backend and retrieve full officer profile
      const data = await authService.verifySession();
      setUser(data.officer);
    } catch (error) {
      console.warn('No active Catalyst session or verification failed.', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Attempt to restore session on application startup
    let mounted = true;
    
    const init = async () => {
      // Small delay to ensure window.catalyst is fully loaded by external script
      // if it's injected asynchronously.
      if (typeof window !== 'undefined' && !(window as any).catalyst) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (mounted) {
        await refreshSession();
      }
    };
    
    init();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const login = useCallback((elementId: string, redirectUrl?: string) => {
    authService.login(elementId, redirectUrl);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

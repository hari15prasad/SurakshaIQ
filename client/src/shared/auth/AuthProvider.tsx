import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, profileApi } from 'shared/api';
import { Officer, AuthContextType, UserRole } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Build a minimal Officer from Catalyst-only data.
   * Used as a fallback when the backend profile endpoint is unavailable.
   */
  const buildFallbackOfficer = useCallback((catalystUser: CatalystUser): Officer => {
    const roleName = catalystUser.role_details.role_name;
    let role: UserRole = 'STATION_OFFICER';
    if (roleName === 'App Administrator') {
      role = 'ADMIN';
    }

    return {
      id: catalystUser.user_id,
      name: `${catalystUser.first_name} ${catalystUser.last_name}`.trim(),
      email: catalystUser.email_id,
      rank: '',
      designation: '',
      role,
      jurisdiction: { type: 'STATE' },
      permissions: [],
    };
  }, []);

  /**
   * Fetch the full officer profile from the backend after Catalyst auth.
   * Falls back to Catalyst-only data if the backend endpoint is unavailable.
   */
  const fetchAndSetOfficerProfile = useCallback(
    async (catalystUser: CatalystUser): Promise<void> => {
      try {
        const { officer: backendOfficer } = await profileApi.fetchProfile();
        setOfficer(backendOfficer);
      } catch {
        console.warn(
          'Officer profile endpoint unavailable — using Catalyst-only profile. ' +
            'This is temporary; deploy the /auth/profile backend endpoint for full role/permission data.'
        );
        setOfficer(buildFallbackOfficer(catalystUser));
      }
    },
    [buildFallbackOfficer]
  );

  // Detect an existing Catalyst session on mount.
  useEffect(() => {
    let cancelled = false;
    const sdk = (window as any).catalyst;

    if (!sdk || !sdk.auth) {
      setIsLoading(false);
      return;
    }

    sdk.auth
      .isUserAuthenticated()
      .then(async (response: any) => {
        if (!cancelled) {
          await fetchAndSetOfficerProfile(response.content);
        }
      })
      .catch(() => {
        // No active Catalyst session.
        if (!cancelled) {
          setOfficer(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchAndSetOfficerProfile]);

  /**
   * Manually (re-)initialize auth state from the current Catalyst session.
   * Can be called after the Catalyst widget completes sign-in.
   */
  const initializeFromCatalyst = useCallback(async (): Promise<void> => {
    const sdk = (window as any).catalyst;
    if (!sdk || !sdk.auth) return;

    setIsLoading(true);
    try {
      const response = await sdk.auth.isUserAuthenticated();
      await fetchAndSetOfficerProfile(response.content);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndSetOfficerProfile]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout to ensure client-side state is cleared
    } finally {
      setOfficer(null);
      setIsLoading(false);
      // Invalidate the Catalyst session and redirect to login.
      // signOut() triggers a full page redirect so it must be called last.
      const sdk = (window as any).catalyst;
      if (sdk && sdk.auth) {
        sdk.auth.signOut(window.location.origin + '/login');
      } else {
        window.location.href = '/login';
      }
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => officer?.permissions.includes(permission) ?? false,
    [officer]
  );

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => (officer ? roles.includes(officer.role) : false),
    [officer]
  );

  const value: AuthContextType = {
    officer,
    isAuthenticated: !!officer,
    isLoading,
    logout,
    hasPermission,
    hasRole,
    initializeFromCatalyst,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

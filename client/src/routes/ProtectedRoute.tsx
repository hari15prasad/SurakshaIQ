import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import { LoadingSkeleton } from 'shared/components';

interface ProtectedRouteProps {
  /** Optional children; renders <Outlet /> when absent (for use as a layout route). */
  children?: React.ReactNode;
}

/**
 * ProtectedRoute
 *
 * Guards any route that requires an authenticated session.
 * - While the session is being verified → renders a full-page loading state.
 * - If the session is absent → redirects to /login, preserving the intended path.
 * - If the session is active → renders children or the nested <Outlet />.
 *
 * Session verification is performed by AuthContext (Phase 4.2B).
 * This component contains no authentication logic of its own.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gov-slate/5">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

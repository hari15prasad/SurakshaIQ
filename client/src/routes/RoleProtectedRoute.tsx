import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { hasRole } from 'utils/permissions';
import type { UserRole } from 'shared/auth/types';

interface RoleProtectedRouteProps {
  roles: UserRole[];
  children?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ roles, children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {hasRole(user, ...roles) ? (
        children ? <>{children}</> : <Outlet />
      ) : (
        <Navigate to="/unauthorized" replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleProtectedRoute;

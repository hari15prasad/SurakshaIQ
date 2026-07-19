import React from 'react';
import { useAuth } from 'hooks/useAuth';
import { UserRole } from './types';
import { hasPermission, hasRole } from 'utils/permissions';

interface RoleGateProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: string[];
  requirePii?: boolean;
  fallback?: React.ReactNode;
  redacted?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  roles,
  permissions,
  requirePii = false,
  fallback = null,
  redacted = <span className="text-gov-slate italic">[Redacted]</span>,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (roles && !hasRole(user, ...roles)) {
    return <>{fallback}</>;
  }

  if (permissions && !permissions.every((permission) => hasPermission(user, permission))) {
    return <>{fallback}</>;
  }

  if (requirePii && !hasPermission(user, 'VIEW_PII')) {
    return <>{redacted}</>;
  }

  return <>{children}</>;
};

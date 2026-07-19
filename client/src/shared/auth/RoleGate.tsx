import React from 'react';
import { useAuth } from 'hooks/useAuth';
import { UserRole, PII_PERMISSIONS } from './types';

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

  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (permissions && !permissions.every((p) => user.permissions.includes(p))) {
    return <>{fallback}</>;
  }

  if (requirePii && !PII_PERMISSIONS.some((p) => user.permissions.includes(p))) {
    return <>{redacted}</>;
  }

  return <>{children}</>;
};

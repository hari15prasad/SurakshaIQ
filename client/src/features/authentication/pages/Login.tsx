import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'shared/auth';

declare global {
  interface Window {
    catalyst: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  // Redirect immediately if the user already has an active Catalyst session.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  // Mount the Catalyst embedded auth widget.
  useEffect(() => {
   if (isAuthenticated) return;

  const sdk = (window as any).catalyst;

  if (!sdk) {
    console.error('Catalyst SDK not loaded');
    return;
  }

  sdk.auth.signIn('loginDivElementId', {
    service_url: '/dashboard',
  });
  }, [isAuthenticated]);

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Officer Sign In</h2>
        <p className="mt-1 text-sm text-gov-slate">Zoho Catalyst Authentication</p>
      </div>
      <div id="loginDivElementId" className="min-h-[300px]"></div>
    </div>
  );
};

export default Login;

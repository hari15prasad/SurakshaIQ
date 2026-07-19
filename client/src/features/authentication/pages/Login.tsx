import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

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

    const catalystAvailable = typeof window !== 'undefined' && !!(window as any).catalyst;
    if (!catalystAvailable) {
      console.warn('Catalyst login widget skipped: SDK unavailable in local development.');
      return;
    }

    try {
      login('loginDivElementId', window.location.origin + from);
    } catch (error) {
      console.error('Catalyst login initialization failed', error);
      toast.error('Failed to initialize login widget. Please refresh the page.');
    }
  }, [isAuthenticated, login, from]);

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

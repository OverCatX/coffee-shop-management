'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        // Redirect to default route for user's role
        const defaultRoute = getDefaultRouteForRole(user?.role || '');
        router.push(defaultRoute);
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, hasRole, user, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}

function getDefaultRouteForRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'manager':
      return '/manager';
    case 'barista':
      return '/barista';
    case 'cashier':
      return '/pos';
    default:
      return '/pos';
  }
}


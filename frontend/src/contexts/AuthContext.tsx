'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tokenStorage, UserInfo, LoginRequest } from '@/lib/api/auth';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = tokenStorage.getUserInfo();
        const token = tokenStorage.get();
        
        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            tokenStorage.setUserInfo(currentUser);
          } catch (error) {
            // Token invalid, clear storage
            tokenStorage.remove();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      tokenStorage.set(response.access_token);
      
      const userInfo: UserInfo = {
        emp_id: response.emp_id,
        name: response.name,
        role: response.role,
        email: response.email,
      };
      
      tokenStorage.setUserInfo(userInfo);
      setUser(userInfo);
      
      // Redirect based on role
      router.push(getDefaultRouteForRole(response.role));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [router]);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get default route for role
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


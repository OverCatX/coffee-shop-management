"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, tokenStorage, UserInfo, LoginRequest } from "@/lib/api/auth";
import { showToast } from "@/utils/toast";

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
          // Set user from storage first (optimistic) - this prevents redirect to login
          setUser(storedUser);
          setIsLoading(false); // Set loading to false immediately so ProtectedRoute doesn't redirect

          // Then verify token is still valid by fetching current user (in background)
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            tokenStorage.setUserInfo(currentUser);
          } catch (error: any) {
            // Only clear if it's a 401 (unauthorized), otherwise keep the stored user
            if (error?.response?.status === 401) {
              // Token invalid, clear storage
              console.warn("Token expired or invalid, clearing storage");
              tokenStorage.remove();
              setUser(null);
              // Redirect to login only if not already there
              if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/login")
              ) {
                router.push("/login");
              }
            } else {
              // Network error or other error - keep stored user
              console.warn(
                "Failed to verify token, using stored user:",
                error?.message || error
              );
              // Don't clear user on network errors - keep the stored user
            }
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await authApi.login(credentials);

        // Store token FIRST before anything else
        tokenStorage.set(response.access_token);

        const userInfo: UserInfo = {
          emp_id: response.emp_id,
          name: response.name,
          role: response.role,
          email: response.email,
        };

        // Store user info
        tokenStorage.setUserInfo(userInfo);

        // Set user state
        setUser(userInfo);

        // Small delay to ensure state is set before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect based on role
        router.push(getDefaultRouteForRole(response.role));
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
    showToast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get default route for role
function getDefaultRouteForRole(role: string): string {
  switch (role.toLowerCase()) {
    case "manager":
      return "/manager";
    case "barista":
      return "/barista";
    case "cashier":
      return "/pos";
    default:
      return "/pos";
  }
}

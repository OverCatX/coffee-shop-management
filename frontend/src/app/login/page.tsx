"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Coffee,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { validateEmail, validatePassword } from "@/utils/validation";
import { showToast } from "@/utils/toast";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      router.push(defaultRoute);
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);

      // Real-time validation
      if (value && emailError) {
        const validation = validateEmail(value);
        if (validation.isValid) {
          setEmailError("");
        } else {
          setEmailError(validation.error || "");
        }
      }
    },
    [emailError]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);

      // Real-time validation
      if (value && passwordError) {
        const validation = validatePassword(value);
        if (validation.isValid) {
          setPasswordError("");
        } else {
          setPasswordError(validation.error || "");
        }
      }
    },
    [passwordError]
  );

  const handleBlur = useCallback(
    (field: "email" | "password") => {
      if (field === "email" && email) {
        const validation = validateEmail(email);
        setEmailError(validation.error || "");
      } else if (field === "password" && password) {
        const validation = validatePassword(password);
        setPasswordError(validation.error || "");
      }
    },
    [email, password]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "");
      showToast.error(emailValidation.error || "Invalid email");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || "");
      showToast.error(passwordValidation.error || "Invalid password");
      return;
    }

    setIsLoading(true);
    const loadingToast = showToast.loading("Signing in...");

    try {
      await login({ email, password });
      showToast.dismiss(loadingToast);
      // Don't show success toast here - AuthContext will handle redirect
      // Redirect is handled in AuthContext
    } catch (err: any) {
      showToast.dismiss(loadingToast);
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Login failed. Please check your credentials.";
      showToast.error(errorMessage);

      // Set field-specific errors if available
      if (errorMessage.toLowerCase().includes("email")) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-stone-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-xl transition-transform hover:scale-105">
            <Coffee className="text-white" size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-2">
            Coffee Shop
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-stone-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-center text-stone-500 text-sm mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-stone-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    emailError
                      ? "text-red-500"
                      : email && !emailError
                      ? "text-green-500"
                      : "text-stone-400"
                  }`}
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur("email")}
                  className={`w-full pl-10 pr-10 py-3.5 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-stone-800 placeholder:text-stone-400 ${
                    emailError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : email && !emailError
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50"
                      : "border-stone-200 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                  placeholder="employee@coffeeshop.com"
                  disabled={isLoading}
                />
                {email && !emailError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="text-green-500" size={18} />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-stone-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    passwordError
                      ? "text-red-500"
                      : password && !passwordError
                      ? "text-green-500"
                      : "text-stone-400"
                  }`}
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur("password")}
                  className={`w-full pl-10 pr-12 py-3.5 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-stone-800 placeholder:text-stone-400 ${
                    passwordError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : password && !passwordError
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50"
                      : "border-stone-200 focus:ring-amber-500 focus:border-amber-500"
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors duration-200 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {password && !passwordError && (
                  <div className="absolute right-11 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="text-green-500" size={18} />
                  </div>
                )}
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {passwordError}
                </p>
              )}
              {password && !passwordError && password.length >= 6 && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Password looks good
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold shadow-lg hover:bg-stone-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-900 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
            <p className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Coffee size={14} />
              Demo Credentials
            </p>
            <div className="text-xs text-amber-800 space-y-2">
              <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                <span className="font-semibold text-amber-900">Manager</span>
                <span className="font-mono text-amber-700 text-[10px] sm:text-xs">
                  john.smith@coffeeshop.com
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                <span className="font-semibold text-amber-900">Barista</span>
                <span className="font-mono text-amber-700 text-[10px] sm:text-xs">
                  sarah.j@coffeeshop.com
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                <span className="font-semibold text-amber-900">Cashier</span>
                <span className="font-mono text-amber-700 text-[10px] sm:text-xs">
                  emma.w@coffeeshop.com
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-2 text-center">
                Password:{" "}
                <span className="font-mono font-semibold">password123</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          © 2024 Coffee Shop Management System
        </p>
      </div>
    </div>
  );
}

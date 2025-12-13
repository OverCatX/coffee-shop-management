'use client';

import { useState, FormEvent, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateEmail, validatePassword } from '@/utils/validation';
import { showToast } from '@/utils/toast';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time validation
    if (value && emailError) {
      const validation = validateEmail(value);
      if (validation.isValid) {
        setEmailError('');
      } else {
        setEmailError(validation.error || '');
      }
    }
  }, [emailError]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Real-time validation
    if (value && passwordError) {
      const validation = validatePassword(value);
      if (validation.isValid) {
        setPasswordError('');
      } else {
        setPasswordError(validation.error || '');
      }
    }
  }, [passwordError]);

  const handleBlur = useCallback((field: 'email' | 'password') => {
    if (field === 'email' && email) {
      const validation = validateEmail(email);
      setEmailError(validation.error || '');
    } else if (field === 'password' && password) {
      const validation = validatePassword(password);
      setPasswordError(validation.error || '');
    }
  }, [email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      showToast.error(emailValidation.error || 'Invalid email');
      return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      showToast.error(passwordValidation.error || 'Invalid password');
      return;
    }
    
    setIsLoading(true);
    const loadingToast = showToast.loading('Signing in...');

    try {
      await login({ email, password });
      showToast.dismiss(loadingToast);
      // Don't show success toast here - AuthContext will handle redirect
      // Redirect is handled in AuthContext
    } catch (err: any) {
      showToast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      showToast.error(errorMessage);
      
      // Set field-specific errors if available
      if (errorMessage.toLowerCase().includes('email')) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes('password')) {
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
        <div className="text-stone-400">Loading...</div>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-2xl mb-4 shadow-lg">
            <Coffee className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Coffee Shop</h1>
          <p className="text-stone-600">Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${emailError ? 'text-red-500' : email && !emailError ? 'text-green-500' : 'text-stone-400'}`} size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : email && !emailError
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-stone-200 focus:ring-amber-500 focus:border-transparent'
                  }`}
                  placeholder="employee@coffeeshop.com"
                  disabled={isLoading}
                />
                {email && !emailError && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                )}
              </div>
              {emailError && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${passwordError ? 'text-red-500' : password && !passwordError ? 'text-green-500' : 'text-stone-400'}`} size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : password && !passwordError
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-stone-200 focus:ring-amber-500 focus:border-transparent'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {password && !passwordError && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                )}
              </div>
              {passwordError && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {passwordError}
                </p>
              )}
              {password && !passwordError && password.length >= 6 && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Password looks good
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold shadow-lg hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-2">Demo Credentials:</p>
            <div className="text-xs text-amber-700 space-y-1">
              <p><strong>Manager:</strong> john.smith@coffeeshop.com / password123</p>
              <p><strong>Barista:</strong> sarah.j@coffeeshop.com / password123</p>
              <p><strong>Cashier:</strong> emma.w@coffeeshop.com / password123</p>
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


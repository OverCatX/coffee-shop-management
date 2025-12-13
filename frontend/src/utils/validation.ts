/**
 * Validation utilities for forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  return { isValid: true };
}

/**
 * Validate phone number (Thai format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return { isValid: true }; // Phone is optional
  }

  const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$|^[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate number
 */
export function validateNumber(value: number | string, min?: number, max?: number): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: "Please enter a valid number" };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number | string): ValidationResult {
  return validateNumber(value, 0);
}


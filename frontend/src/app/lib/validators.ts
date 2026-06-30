/**
 * Simple email validator matching standard patterns.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates password complexity:
 * - At least 8 characters
 * - Contains at least one letter
 * - Contains at least one digit
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter.");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Basic input sanitization to strip HTML tags and restrict length.
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (!input) return "";

  // Strip HTML tags
  let sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Max length check
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Password must include at least one letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  return null;
}

export function validateFullName(fullName: string): string | null {
  const value = fullName.trim();
  if (!value) {
    return "Full name is required.";
  }
  if (value.length < 2) {
    return "Enter your full name.";
  }
  return null;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function validateUsername(username: string): string | null {
  const value = username.trim().toLowerCase();
  if (!value) {
    return "Username is required.";
  }
  if (!USERNAME_PATTERN.test(value)) {
    return "Use 3–20 characters: lowercase letters, numbers, or underscore.";
  }
  return null;
}

export function validateSignup(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const nameError = validateFullName(input.fullName);
  const emailError = validateEmail(input.email);
  const passwordError = validatePassword(input.password);

  if (nameError) {
    errors.fullName = nameError;
  }
  if (emailError) {
    errors.email = emailError;
  }
  if (passwordError) {
    errors.password = passwordError;
  }
  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(input.email);
  if (emailError) {
    errors.email = emailError;
  }
  if (!input.password) {
    errors.password = "Password is required.";
  }
  return errors;
}

export function mapAuthError(message: string | undefined): string {
  const value = (message ?? "").toLowerCase();
  if (value.includes("invalid login credentials")) {
    return "That email or password is not correct.";
  }
  if (value.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox for the Aro link.";
  }
  if (value.includes("user already registered") || value.includes("already been registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (value.includes("password should be at least")) {
    return "Password must be at least 8 characters.";
  }
  if (value.includes("signup is disabled")) {
    return "New accounts are temporarily disabled. Try again later.";
  }
  if (value.includes("rate limit") || value.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  return message?.trim() || "Something went wrong. Try again.";
}

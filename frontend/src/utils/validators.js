export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
};

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const validatePincode = (pincode) => /^\d{6}$/.test(pincode);

export const required = (value) => (value ? null : 'This field is required');

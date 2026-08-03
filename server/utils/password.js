const { PASSWORD_RULES } = require('../constants');

const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3 || username.length > 30)
    return 'Username must be between 3 and 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return 'Username can only contain letters, numbers, and underscores';
  return null;
};

module.exports = {
  validatePassword,
  validateEmail,
  validateUsername
};

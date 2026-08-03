/**
 * Format a date to a readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password meets requirements
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Must contain a lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Must contain an uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Must contain a number';
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password))
    return 'Must contain a special character';
  return null;
};

/**
 * Get password strength label and color
 */
export const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/(?=.*[a-z])/.test(password)) score++;
  if (/(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*\d)/.test(password)) score++;
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-danger', textColor: 'text-danger', score };
  if (score <= 3) return { label: 'Fair', color: 'bg-warning', textColor: 'text-warning', score };
  if (score <= 4) return { label: 'Good', color: 'bg-accent', textColor: 'text-accent-text', score };
  return { label: 'Strong', color: 'bg-success', textColor: 'text-success', score };
};

/**
 * Class name merger utility
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

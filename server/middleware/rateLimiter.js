const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 5, message = 'Too many requests. Please try again later.') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Strict limiter for login endpoint only (not all auth routes)
const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many login attempts. Please try again after 15 minutes.'
);

// Lighter limiter for registration to prevent spam
const registerLimiter = createRateLimiter(
  60 * 60 * 1000,
  50,
  'Too many registration attempts. Please try again after an hour.'
);

// Moderate limiter for password reset flows
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many attempts. Please try again after 15 minutes.'
);

const otpLimiter = createRateLimiter(
  15 * 60 * 1000,
  30,
  'Too many OTP requests. Please try again after 15 minutes.'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  1000,
  'Too many requests. Please try again later.'
);

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  authLimiter,
  otpLimiter,
  apiLimiter
};

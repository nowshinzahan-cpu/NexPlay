const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const passwordController = require('../controllers/passwordController');
const validateMiddleware = require('../middleware/validateMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validateMiddleware
  ],
  passwordController.forgotPassword
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP is required'),
    validateMiddleware
  ],
  passwordController.verifyOTP
);

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validateMiddleware
  ],
  passwordController.resendOTP
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  authLimiter,
  [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword').exists().withMessage('Confirm password is required'),
    validateMiddleware
  ],
  passwordController.resetPassword
);

module.exports = router;

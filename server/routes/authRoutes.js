const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post(
  '/register',
  registerLimiter,
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword').exists().withMessage('Confirm password is required'),
    validateMiddleware
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('emailOrUsername').trim().notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateMiddleware
  ],
  authController.login
);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, authController.getMe);

// POST /api/auth/logout (protected)
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

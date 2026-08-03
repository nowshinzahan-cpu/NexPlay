const logger = require('../utils/logger');
const { User, Company } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { validatePassword, validateEmail, validateUsername } = require('../utils/password');
const { isEmailTaken, isUsernameTaken, sanitizeInput } = require('../helpers');
const { HTTP_STATUS, ROLES } = require('../constants');
const { recordLogin } = require('../services/gamificationService');

/**
 * POST /api/auth/register
 * Register a new user or company
 */
const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, confirmPassword, role } = req.body;

    // Validation
    const errors = [];

    if (!fullName || fullName.trim().length < 2) {
      errors.push('Full name is required and must be at least 2 characters');
    }

    const usernameError = validateUsername(username);
    if (usernameError) errors.push(usernameError);

    const emailError = validateEmail(email);
    if (emailError) errors.push(emailError);

    const passwordErrors = validatePassword(password);
    errors.push(...passwordErrors);

    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      return sendError(res, errors.join('. '), HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    // Check for existing email and username across both collections
    const [emailTaken, usernameTaken] = await Promise.all([
      isEmailTaken(email),
      isUsernameTaken(username)
    ]);

    if (emailTaken) {
      return sendError(res, 'Email already exists', HTTP_STATUS.CONFLICT, 'DUPLICATE_EMAIL');
    }

    if (usernameTaken) {
      return sendError(res, 'Username already taken', HTTP_STATUS.CONFLICT, 'DUPLICATE_USERNAME');
    }

    if (role === 'company') {
      const company = await Company.create({
        companyName: fullName,
        username,
        email,
        password,
        verificationStatus: 'pending'
      });

      return sendSuccess(
        res,
        { userId: company._id },
        'Company account created successfully. Please log in.',
        HTTP_STATUS.CREATED
      );
    }

    // Prevent public registration as admin
    const userRole = role === 'admin' ? ROLES.USER : (role || ROLES.USER);

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role: userRole
    });

    return sendSuccess(
      res,
      { userId: user._id },
      'Account created successfully. Please log in.',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email or username
 */
const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password, rememberMe } = req.body;

    // Sanitize: strip invisible Unicode characters (zero-width spaces, BOM, etc.)
    const cleanEmailOrUsername = sanitizeInput(emailOrUsername);
    const cleanPassword = password ? sanitizeInput(String(password)) : password;

    if (!cleanEmailOrUsername) {
      return sendError(res, 'Email or username is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_CREDENTIALS');
    }
    if (!cleanPassword) {
      return sendError(res, 'Password is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_PASSWORD');
    }

    const query = cleanEmailOrUsername.toLowerCase();

    // Try to find user first
    let user = await User.findOne({
      $or: [{ email: query }, { username: query }]
    }).select('+password');

    let userType = 'user';
    let role = ROLES.USER;

    if (user) {
      role = user.role;
    } else {
      // Try company
      user = await Company.findOne({
        $or: [{ email: query }, { username: query }]
      }).select('+password');
      userType = 'company';
      role = ROLES.COMPANY;
    }

    if (!user) {
      return sendError(res, 'Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', HTTP_STATUS.FORBIDDEN, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 🎮 Record gamification for login (streak + daily points)
    if (userType === 'user') {
      recordLogin(user._id).catch(err => {
        // Non-blocking - gamification failure should not prevent login
        logger.error('Gamification recordLogin failed:', { message: err.message });
      });
    }

    const payload = {
      userId: user._id,
      role: role,
      type: userType,
      email: user.email
    };

    const tokens = generateTokenPair(payload, rememberMe);

    const userData = {
      id: user._id,
      email: user.email,
      role: role,
      name: user.fullName || user.companyName,
      verificationStatus: user.verificationStatus || undefined,
      rejectionReason: user.rejectionReason || undefined
    };

    return sendSuccess(res, {
      ...tokens,
      user: userData
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, 'Refresh token is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_TOKEN');
    }

    const decoded = verifyRefreshToken(token);

    // Verify user/company still exists and is active
    let account;
    if (decoded.type === 'company') {
      account = await Company.findById(decoded.userId).select('isActive email');
    } else {
      account = await User.findById(decoded.userId).select('isActive email role');
    }

    if (!account) {
      return sendError(res, 'Account not found. Please login again.', HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_NOT_FOUND');
    }

    if (!account.isActive) {
      return sendError(res, 'Account has been deactivated. Please contact support.', HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_DEACTIVATED');
    }

    const payload = {
      userId: decoded.userId,
      role: account.role || decoded.role,
      type: decoded.type,
      email: account.email
    };

    const tokens = generateTokenPair(payload);

    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Refresh token has expired. Please login again.', HTTP_STATUS.UNAUTHORIZED, 'REFRESH_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid refresh token.', HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
    }
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
const getMe = async (req, res, next) => {
  try {
    let user;
    if (req.user.type === 'company') {
      user = await Company.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    const userData = user.toPublicProfile ? user.toPublicProfile() : user.toJSON();
    if (user.verificationStatus) {
      userData.verificationStatus = user.verificationStatus;
      userData.rejectionReason = user.rejectionReason;
    }

    return sendSuccess(res, { user: userData }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, server acknowledges)
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout
};

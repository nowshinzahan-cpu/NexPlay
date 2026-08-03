const { User, Company, Verification } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { validatePassword } = require('../utils/password');
const { generateOTP, generateResetToken } = require('../utils/helpers');
const { sendPasswordResetOTP } = require('../services/emailService');
const { HTTP_STATUS, VERIFICATION_PURPOSE, OTP_CONFIG, TOKEN_CONFIG } = require('../constants');

/**
 * POST /api/auth/forgot-password
 * Send OTP to email for password reset
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_EMAIL');
    }

    // Find user in either collection
    let user = await User.findOne({ email: email.toLowerCase() });
    let userType = 'User';

    if (!user) {
      user = await Company.findOne({ email: email.toLowerCase() });
      userType = 'Company';
    }

    // Always return same message for security
    if (!user) {
      return sendSuccess(res, {}, 'If an account exists with this email, you will receive a reset code.');
    }

    // Block admin accounts from password reset
    if (user.role === 'admin') {
      return sendSuccess(res, {}, 'If an account exists with this email, you will receive a reset code.');
    }

    // Invalidate previous OTPs
    await Verification.updateMany(
      {
        userId: user._id,
        userType,
        purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
        isUsed: false
      },
      { isUsed: true }
    );

    // Generate OTP
    const otp = generateOTP(OTP_CONFIG.LENGTH);
    const token = generateResetToken();

    await Verification.create({
      userId: user._id,
      userType,
      token,
      otp,
      purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)
    });

    // Send email
    await sendPasswordResetOTP(email, otp);

    return sendSuccess(res, {}, 'If an account exists with this email, you will receive a reset code.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return temporary reset token
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 'Email and OTP are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    // Find user
    let user = await User.findOne({ email: email.toLowerCase() });
    let userType = 'User';

    if (!user) {
      user = await Company.findOne({ email: email.toLowerCase() });
      userType = 'Company';
    }

    if (!user) {
      return sendError(res, 'Invalid request', HTTP_STATUS.BAD_REQUEST, 'INVALID_REQUEST');
    }

    // Find valid OTP record
    const verification = await Verification.findOne({
      userId: user._id,
      userType,
      otp,
      purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return sendError(res, 'Invalid or expired OTP', HTTP_STATUS.BAD_REQUEST, 'INVALID_OTP');
    }

    // Mark OTP as used
    verification.isUsed = true;
    await verification.save();

    // Generate a new reset token for the next step
    const resetToken = generateResetToken();

    await Verification.create({
      userId: user._id,
      userType,
      token: resetToken,
      purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + TOKEN_CONFIG.RESET_EXPIRY_HOURS * 60 * 60 * 1000)
    });

    return sendSuccess(res, { resetToken }, 'OTP verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend a new OTP
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_EMAIL');
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    let userType = 'User';

    if (!user) {
      user = await Company.findOne({ email: email.toLowerCase() });
      userType = 'Company';
    }

    if (!user) {
      return sendSuccess(res, {}, 'If an account exists, you will receive a reset code.');
    }

    // Invalidate previous OTPs
    await Verification.updateMany(
      {
        userId: user._id,
        userType,
        purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
        isUsed: false
      },
      { isUsed: true }
    );

    // Generate new OTP
    const otp = generateOTP(OTP_CONFIG.LENGTH);
    const token = generateResetToken();

    await Verification.create({
      userId: user._id,
      userType,
      token,
      otp,
      purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000)
    });

    await sendPasswordResetOTP(email, otp);

    return sendSuccess(res, {}, 'A new OTP has been sent to your email.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken) {
      return sendError(res, 'Reset token is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_TOKEN');
    }

    if (!newPassword || !confirmPassword) {
      return sendError(res, 'New password and confirm password are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_PASSWORD');
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'Passwords do not match', HTTP_STATUS.BAD_REQUEST, 'PASSWORD_MISMATCH');
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return sendError(res, passwordErrors.join('. '), HTTP_STATUS.BAD_REQUEST, 'WEAK_PASSWORD');
    }

    // Find valid reset token
    const verification = await Verification.findOne({
      token: resetToken,
      purpose: VERIFICATION_PURPOSE.PASSWORD_RESET,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return sendError(res, 'Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST, 'INVALID_TOKEN');
    }

    // Find user and update password
    const Model = verification.userType === 'Company' ? Company : User;
    const user = await Model.findById(verification.userId).select('+password');

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Block admin accounts from password reset
    if (user.role === 'admin') {
      return sendError(res, 'Admin accounts cannot reset passwords', HTTP_STATUS.FORBIDDEN, 'ADMIN_NOT_ALLOWED');
    }

    user.password = newPassword;
    await user.save();

    // Mark token as used
    verification.isUsed = true;
    await verification.save();

    return sendSuccess(res, {}, 'Password reset successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword
};

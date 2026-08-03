const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { validatePassword } = require('../utils/password');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/user/profile
 * Get current user's profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, { user: user.toPublicProfile() }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'avatar'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No valid fields to update', HTTP_STATUS.BAD_REQUEST, 'NO_UPDATES');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, { user: user.toPublicProfile() }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/user/change-password
 * Change current user's password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(
        res,
        'Current password, new password, and confirm password are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'New passwords do not match', HTTP_STATUS.BAD_REQUEST, 'PASSWORD_MISMATCH');
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return sendError(res, passwordErrors.join('. '), HTTP_STATUS.BAD_REQUEST, 'WEAK_PASSWORD');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', HTTP_STATUS.UNAUTHORIZED, 'INVALID_PASSWORD');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};

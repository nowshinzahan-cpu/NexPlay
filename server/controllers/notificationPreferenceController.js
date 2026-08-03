const { NotificationPreference } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/notification-preferences
 * Get current user's notification preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    let prefs = await NotificationPreference.findOne({ userId: req.user.id }).lean();

    if (!prefs) {
      // Return defaults
      prefs = {
        userId: req.user.id,
        matchReminders: true,
        reminderMinutesBefore: 30,
        goalAlerts: true,
        tournamentAnnouncements: true,
        reviewReplies: true,
        discussionReplies: true,
        forumDigest: false,
        emailNotifications: false
      };
    }

    return sendSuccess(res, { preferences: prefs }, 'Preferences retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notification-preferences
 * Update notification preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const allowedFields = [
      'matchReminders', 'reminderMinutesBefore', 'goalAlerts',
      'tournamentAnnouncements', 'reviewReplies', 'discussionReplies',
      'forumDigest', 'emailNotifications'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No valid fields to update', HTTP_STATUS.BAD_REQUEST, 'NO_UPDATES');
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return sendSuccess(res, { preferences: prefs }, 'Preferences updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};

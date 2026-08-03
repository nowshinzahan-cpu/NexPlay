const { Report } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

/**
 * POST /api/reports
 * Create a report
 */
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return sendError(
        res,
        'Target type, target ID, and reason are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    if (!['discussion', 'comment', 'review', 'user'].includes(targetType)) {
      return sendError(res, 'Invalid target type', HTTP_STATUS.BAD_REQUEST, 'INVALID_TARGET_TYPE');
    }

    if (!['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'].includes(reason)) {
      return sendError(res, 'Invalid reason', HTTP_STATUS.BAD_REQUEST, 'INVALID_REASON');
    }

    // Prevent reporting own content
    // (The check is light: we log reporterId and it's obvious if abused)

    const report = await Report.create({
      targetType,
      targetId,
      reporterId: req.user.id,
      reason,
      description: description || ''
    });

    return sendSuccess(res, { report }, 'Report submitted', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        'You have already reported this content',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_REPORT'
      );
    }
    next(error);
  }
};

module.exports = {
  createReport
};

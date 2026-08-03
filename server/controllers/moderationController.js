const { Report, Discussion, Comment, ItemReview } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/moderation/reports
 * Get reports with status filter
 */
const getReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status = 'pending', targetType } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporterId', 'fullName username email')
        .populate('resolvedBy', 'fullName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter)
    ]);

    return sendPaginated(res, reports, total, page, limit, 'Reports retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/moderation/reports/:id
 * Resolve or dismiss a report
 */
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNote, hideTarget, deleteTarget } = req.body;

    if (!status || !['resolved', 'dismissed'].includes(status)) {
      return sendError(res, 'Valid status (resolved/dismissed) is required', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return sendError(res, 'Report not found', HTTP_STATUS.NOT_FOUND, 'REPORT_NOT_FOUND');
    }

    if (report.status !== 'pending') {
      return sendError(res, 'Report already resolved', HTTP_STATUS.BAD_REQUEST, 'ALREADY_RESOLVED');
    }

    report.status = status;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    if (resolutionNote) report.resolutionNote = resolutionNote;
    await report.save();

    // If resolved, optionally hide/delete the target
    if (status === 'resolved') {
      if (deleteTarget && hideTarget !== false) {
        await softDeleteTarget(report.targetType, report.targetId);
      } else if (hideTarget) {
        await hideTargetContent(report.targetType, report.targetId);
      }
    }

    return sendSuccess(res, { report }, 'Report resolved');
  } catch (error) {
    next(error);
  }
};

async function softDeleteTarget(targetType, targetId) {
  switch (targetType) {
    case 'discussion':
      await Discussion.findByIdAndUpdate(targetId, { $set: { isActive: false } });
      break;
    case 'comment':
      await Comment.findByIdAndUpdate(targetId, { $set: { isActive: false } });
      break;
    case 'review':
      await ItemReview.findByIdAndUpdate(targetId, { $set: { isActive: false } });
      break;
  }
}

async function hideTargetContent(targetType, targetId) {
  switch (targetType) {
    case 'comment':
      await Comment.findByIdAndUpdate(targetId, { $set: { isHidden: true } });
      break;
  }
}

/**
 * GET /api/moderation/stats
 * Get moderation dashboard stats
 */
const getModerationStats = async (req, res, next) => {
  try {
    const [pendingCount, resolvedCount, dismissedCount] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' })
    ]);

    return sendSuccess(res, {
      pending: pendingCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
      total: pendingCount + resolvedCount + dismissedCount
    }, 'Moderation stats retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  resolveReport,
  getModerationStats
};

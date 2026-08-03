const { User, Company, AdminLog, Notification, Advertisement, Campaign, Content } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination, parseSearchQuery } = require('../utils/helpers');
const { sendVerificationNotification } = require('../services/emailService');
const { HTTP_STATUS, VERIFICATION_STATUS, NOTIFICATION_TYPES } = require('../constants');

/**
 * POST /api/admin/notifications/broadcast
 * Admin: broadcast a system-wide announcement to all users
 */
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return sendError(res, 'Title and message are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    // Create notifications for all active users and companies
    const [users, companies] = await Promise.all([
      User.find({ isActive: true }).select('_id'),
      Company.find({ isActive: true }).select('_id')
    ]);

    const notifications = [];
    users.forEach(user => {
      notifications.push({
        recipientId: user._id,
        recipientType: 'User',
        type: type || NOTIFICATION_TYPES.SYSTEM,
        title,
        message,
        link: '/user/dashboard'
      });
    });
    companies.forEach(company => {
      notifications.push({
        recipientId: company._id,
        recipientType: 'Company',
        type: type || NOTIFICATION_TYPES.SYSTEM,
        title,
        message,
        link: '/company/dashboard'
      });
    });

    await Notification.insertMany(notifications);

    await AdminLog.create({
      adminId: req.user.id,
      action: 'BROADCAST',
      targetType: 'System',
      details: `Broadcast: ${title}`,
      ipAddress: req.ip
    });

    return sendSuccess(res, { count: notifications.length }, 'Broadcast sent successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/contents/:id/featured
 * Admin: toggle featured status for content
 */
const toggleFeaturedContent = async (req, res, next) => {
  try {
    const { isFeatured } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return sendError(res, 'Content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    content.isFeatured = isFeatured !== undefined ? isFeatured : !content.isFeatured;
    await content.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: content.isFeatured ? 'CONTENT_FEATURED' : 'CONTENT_UNFEATURED',
      targetType: 'Content',
      targetId: content._id,
      details: `${content.isFeatured ? 'Featured' : 'Unfeatured'} content: ${content.title}`,
      ipAddress: req.ip
    });

    return sendSuccess(
      res,
      { content: { _id: content._id, title: content.title, isFeatured: content.isFeatured } },
      `Content ${content.isFeatured ? 'featured' : 'unfeatured'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/contents/featured
 * Admin: get all featured content
 */
const getFeaturedContent = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { isFeatured: true };
    const [contents, total] = await Promise.all([
      Content.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(filter)
    ]);

    return sendPaginated(res, contents, total, page, limit, 'Featured content retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/stats
 * Get aggregated dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      pendingVerifications,
      verifiedCompanies,
      rejectedCompanies,
      totalAdvertisements,
      activeAdvertisements,
      pendingAdvertisements,
      totalCampaigns,
      activeCampaigns
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'admin'] } }),
      Company.countDocuments(),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.REJECTED }),
      Advertisement.countDocuments(),
      Advertisement.countDocuments({ status: 'active' }),
      Advertisement.countDocuments({ status: 'pending' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'active' })
    ]);

    // Sprint 3 & 4 — Additional Stats
    const { Match, Discussion, Review: ItemReview, UserBadge, PointsLedger } = require('../models');
    const [
      totalMatches,
      liveMatches,
      totalDiscussions,
      totalItemReviews,
      totalBadgesAwarded,
      recentPointsEarned,
      pendingReports
    ] = await Promise.all([
      Match.countDocuments(),
      Match.countDocuments({ status: { $in: ['live', 'halftime'] } }),
      Discussion.countDocuments(),
      ItemReview.countDocuments(),
      UserBadge.countDocuments(),
      PointsLedger.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      require('../models/Report').countDocuments({ status: 'pending' })
    ]);

    const totalUpcomingContents = await Content.countDocuments({ status: 'Upcoming' });

    return sendSuccess(res, {
      totalUsers,
      totalCompanies,
      pendingVerifications,
      verifiedCompanies,
      rejectedCompanies,
      totalAdvertisements,
      activeAdvertisements,
      pendingAdvertisements,
      totalCampaigns,
      activeCampaigns,
      totalUpcomingContents,
      // Sprint 3 & 4
      totalMatches,
      liveMatches,
      totalDiscussions,
      totalItemReviews,
      totalBadgesAwarded,
      recentPointsEarned,
      pendingReports
    }, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Get all users with pagination, search, and filter
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, search } = req.query;

    const filter = { role: { $in: ['user', 'admin'] } };

    if (search) {
      const searchRegex = parseSearchQuery(search);
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { username: searchRegex }
      ];
    }

    if (status === 'active') filter.isActive = true;
    if (status === 'blocked') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return sendPaginated(res, users, total, page, limit, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
const deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id.toString()) {
      return sendError(res, 'Cannot delete your own account', HTTP_STATUS.BAD_REQUEST, 'SELF_DELETE');
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Cascade cleanup: remove associated records
    const { Notification, Verification } = require('../models');
    await Promise.all([
      Notification.deleteMany({ recipientId: user._id, recipientType: 'User' }),
      Verification.deleteMany({ userId: user._id, userType: 'User' })
    ]);

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: user._id,
      details: `Deleted user: ${user.email}`,
      ipAddress: req.ip
    });

    return sendSuccess(res, {}, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Block or unblock a user
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Prevent self-blocking
    if (req.params.id === req.user.id.toString()) {
      return sendError(res, 'Cannot change your own account status', HTTP_STATUS.BAD_REQUEST, 'SELF_STATUS');
    }

    // Validate isActive is boolean
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return sendError(res, 'isActive must be a boolean', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: user.isActive ? 'USER_UNBLOCKED' : 'USER_BLOCKED',
      targetType: 'User',
      targetId: user._id,
      details: `${user.isActive ? 'Unblocked' : 'Blocked'} user: ${user.email}`,
      ipAddress: req.ip
    });

    return sendSuccess(res, { user: user.toPublicProfile() }, `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/companies
 * Get all companies with pagination, search, and filter
 */
const getCompanies = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, search, industry } = req.query;

    const filter = {};

    if (status && Object.values(VERIFICATION_STATUS).includes(status)) {
      filter.verificationStatus = status;
    }

    if (search) {
      const searchRegex = parseSearchQuery(search);
      filter.$or = [
        { companyName: searchRegex },
        { email: searchRegex },
        { username: searchRegex }
      ];
    }

    if (industry) {
      filter.industry = parseSearchQuery(industry);
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments(filter)
    ]);

    return sendPaginated(res, companies, total, page, limit, 'Companies retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/companies/pending
 * Get all pending companies
 */
const getPendingCompanies = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [companies, total] = await Promise.all([
      Company.find({ verificationStatus: VERIFICATION_STATUS.PENDING })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING })
    ]);

    return sendPaginated(res, companies, total, page, limit, 'Pending companies retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/companies/:id
 * Get a single company's full details
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).select('-password');

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    return sendSuccess(res, { company: company.toPublicProfile() }, 'Company retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/companies/:id/verify
 * Approve or reject a company verification
 */
const verifyCompany = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status || !Object.values(VERIFICATION_STATUS).includes(status)) {
      return sendError(res, 'Valid status is required (verified/rejected)', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
    }

    if (status === VERIFICATION_STATUS.PENDING) {
      return sendError(res, 'Cannot set status to pending', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    if (company.verificationStatus === status) {
      return sendError(res, `Company is already ${status}`, HTTP_STATUS.BAD_REQUEST, 'ALREADY_VERIFIED');
    }

    company.verificationStatus = status;
    if (status === VERIFICATION_STATUS.REJECTED) {
      company.rejectionReason = rejectionReason || 'No specific reason provided';
      company.rejectedAt = new Date();
      company.approvedAt = null;
    } else {
      company.rejectionReason = '';
      company.approvedAt = new Date();
      company.rejectedAt = null;
    }
    await company.save();

    // Create notification for the company
    const notificationData = {
      recipientId: company._id,
      recipientType: 'Company',
      type: 'verification',
      link: '/company/dashboard'
    };

    if (status === VERIFICATION_STATUS.VERIFIED) {
      notificationData.title = 'Company Verified';
      notificationData.message = 'Congratulations! Your company has been verified successfully.';
    } else {
      notificationData.title = 'Verification Rejected';
      notificationData.message = `Your company verification request has been rejected. Reason: ${company.rejectionReason}`;
    }

    await Notification.create(notificationData);

    // Send email notification
    await sendVerificationNotification(company.email, company.companyName, status, company.rejectionReason);

    // Log the action
    await AdminLog.create({
      adminId: req.user.id,
      action: status === 'verified' ? 'COMPANY_VERIFIED' : 'COMPANY_REJECTED',
      targetType: 'Company',
      targetId: company._id,
      details: `${status === 'verified' ? 'Verified' : 'Rejected'} company: ${company.companyName}`,
      ipAddress: req.ip
    });

    return sendSuccess(
      res,
      { company: company.toPublicProfile() },
      `Company ${status} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/activity-log
 * Get admin activity log
 */
const getActivityLog = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [logs, total] = await Promise.all([
      AdminLog.find()
        .populate('adminId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AdminLog.countDocuments()
    ]);

    return sendPaginated(res, logs, total, page, limit, 'Activity log retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/companies/:id
 * Delete a company
 */
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    // Cascade cleanup: remove associated records
    const { Notification, Verification, Campaign, Advertisement } = require('../models');
    await Promise.all([
      Notification.deleteMany({ recipientId: company._id, recipientType: 'Company' }),
      Verification.deleteMany({ userId: company._id, userType: 'Company' }),
      Campaign.deleteMany({ companyId: company._id }),
      Advertisement.deleteMany({ companyId: company._id })
    ]);

    await AdminLog.create({
      adminId: req.user.id,
      action: 'COMPANY_DELETED',
      targetType: 'Company',
      targetId: company._id,
      details: `Deleted company: ${company.companyName} (${company.email})`,
      ipAddress: req.ip
    });

    return sendSuccess(res, {}, 'Company deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/companies/:id/status
 * Block or unblock a company
 */
const toggleCompanyStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    company.isActive = isActive !== undefined ? isActive : !company.isActive;
    await company.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: company.isActive ? 'COMPANY_UNBLOCKED' : 'COMPANY_BLOCKED',
      targetType: 'Company',
      targetId: company._id,
      details: `${company.isActive ? 'Unblocked' : 'Blocked'} company: ${company.companyName}`,
      ipAddress: req.ip
    });

    return sendSuccess(
      res,
      { company: company.toPublicProfile() },
      `Company ${company.isActive ? 'unblocked' : 'blocked'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  deleteUser,
  toggleUserStatus,
  getCompanies,
  getPendingCompanies,
  getCompanyById,
  verifyCompany,
  deleteCompany,
  toggleCompanyStatus,
  getActivityLog,
  broadcastNotification,
  toggleFeaturedContent,
  getFeaturedContent
};

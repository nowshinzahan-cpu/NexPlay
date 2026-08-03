const { Advertisement, Company } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/company/advertisements
 * Get company's own advertisements
 */
const getMyAdvertisements = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = { companyId: req.user.id };
    if (status) filter.status = status;

    const [ads, total] = await Promise.all([
      Advertisement.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Advertisement.countDocuments(filter)
    ]);

    return sendPaginated(res, ads, total, page, limit, 'Advertisements retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/advertisements/:id
 * Get single advertisement
 */
const getMyAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findOne({
      _id: req.params.id,
      companyId: req.user.id
    });

    if (!ad) {
      return sendError(res, 'Advertisement not found', HTTP_STATUS.NOT_FOUND, 'AD_NOT_FOUND');
    }

    return sendSuccess(res, { advertisement: ad }, 'Advertisement retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company/advertisements
 * Create a new advertisement (verified companies only)
 */
const createAdvertisement = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.id);
    if (!company || company.verificationStatus !== 'verified') {
      return sendError(
        res,
        'Only verified companies can create advertisements',
        HTTP_STATUS.FORBIDDEN,
        'NOT_VERIFIED'
      );
    }

    const { title, description, imageUrl, targetUrl, placement, startDate, endDate, budget } = req.body;

    if (!title) {
      return sendError(res, 'Title is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_TITLE');
    }

    const advertisement = await Advertisement.create({
      companyId: req.user.id,
      title,
      description: description || '',
      imageUrl: imageUrl || '',
      targetUrl: targetUrl || '',
      placement: placement || 'banner',
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget || 0
    });

    return sendSuccess(res, { advertisement }, 'Advertisement created. Pending review.', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/company/advertisements/:id
 * Update an advertisement
 */
const updateAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findOne({
      _id: req.params.id,
      companyId: req.user.id
    });

    if (!ad) {
      return sendError(res, 'Advertisement not found', HTTP_STATUS.NOT_FOUND, 'AD_NOT_FOUND');
    }

    if (ad.status === 'active' || ad.status === 'rejected' || ad.status === 'expired') {
      return sendError(
        res,
        `Cannot update an advertisement with status: ${ad.status}`,
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_STATUS'
      );
    }

    const allowedFields = ['title', 'description', 'imageUrl', 'targetUrl', 'placement', 'startDate', 'endDate', 'budget'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        ad[field] = req.body[field];
      }
    }

    await ad.save();

    return sendSuccess(res, { advertisement: ad }, 'Advertisement updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/company/advertisements/:id
 * Delete an advertisement
 */
const deleteAdvertisement = async (req, res, next) => {
  try {
    const ad = await Advertisement.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
      status: { $ne: 'active' }
    });

    if (!ad) {
      return sendError(res, 'Advertisement not found or cannot be deleted', HTTP_STATUS.NOT_FOUND, 'AD_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Advertisement deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/advertisements
 * Admin: get all advertisements
 */
const adminGetAdvertisements = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, companyId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;

    const [ads, total] = await Promise.all([
      Advertisement.find(filter)
        .populate('companyId', 'companyName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Advertisement.countDocuments(filter)
    ]);

    return sendPaginated(res, ads, total, page, limit, 'Advertisements retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/advertisements/active
 * Public: Get active advertisements by placement
 * Used for displaying ads on LandingPage and SearchPage (FR-16)
 */
const getActiveAdvertisements = async (req, res, next) => {
  try {
    const { placement, limit = 5 } = req.query;
    const now = new Date();

    // Build date filter: ad is active if startDate is in the past (or not set)
    // and endDate is in the future (or not set)
    const filter = {
      status: 'active',
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };

    if (placement) {
      filter.placement = placement;
    }

    const ads = await Advertisement.find(filter)
      .populate('companyId', 'companyName logo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 5)
      .lean();

    return sendSuccess(res, ads, 'Active advertisements retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/advertisements/:id/status
 * Admin: approve/reject/pause advertisement
 */
const adminUpdateAdStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['active', 'rejected', 'paused'];

    if (!status || !validStatuses.includes(status)) {
      return sendError(
        res,
        'Valid status is required (active/rejected/paused)',
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_STATUS'
      );
    }

    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return sendError(res, 'Advertisement not found', HTTP_STATUS.NOT_FOUND, 'AD_NOT_FOUND');
    }

    ad.status = status;
    if (status === 'rejected') {
      ad.rejectionReason = rejectionReason || 'No specific reason provided';
    }
    await ad.save();

    return sendSuccess(res, { advertisement: ad }, `Advertisement ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAdvertisements,
  getMyAdvertisement,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  adminGetAdvertisements,
  adminUpdateAdStatus,
  getActiveAdvertisements
};

const { Campaign, Company } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/company/campaigns
 * Get company's own campaigns
 */
const getMyCampaigns = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = { companyId: req.user.id };
    if (status) filter.status = status;

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate('advertisements')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(filter)
    ]);

    return sendPaginated(res, campaigns, total, page, limit, 'Campaigns retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/campaigns/:id
 * Get single campaign
 */
const getMyCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      companyId: req.user.id
    }).populate('advertisements');

    if (!campaign) {
      return sendError(res, 'Campaign not found', HTTP_STATUS.NOT_FOUND, 'CAMPAIGN_NOT_FOUND');
    }

    return sendSuccess(res, { campaign }, 'Campaign retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company/campaigns
 * Create a new campaign (verified companies only)
 */
const createCampaign = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.id);
    if (!company || company.verificationStatus !== 'verified') {
      return sendError(
        res,
        'Only verified companies can create campaigns',
        HTTP_STATUS.FORBIDDEN,
        'NOT_VERIFIED'
      );
    }

    const { name, description, advertisements, startDate, endDate, budget, targetAudience } = req.body;

    if (!name) {
      return sendError(res, 'Campaign name is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_NAME');
    }

    const campaign = await Campaign.create({
      companyId: req.user.id,
      name,
      description: description || '',
      advertisements: advertisements || [],
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget || 0,
      targetAudience: targetAudience || ''
    });

    return sendSuccess(res, { campaign }, 'Campaign created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/company/campaigns/:id
 * Update a campaign
 */
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      companyId: req.user.id
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found', HTTP_STATUS.NOT_FOUND, 'CAMPAIGN_NOT_FOUND');
    }

    if (campaign.status === 'active' || campaign.status === 'rejected' || campaign.status === 'completed') {
      return sendError(
        res,
        `Cannot update a campaign with status: ${campaign.status}`,
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_STATUS'
      );
    }

    const allowedFields = ['name', 'description', 'advertisements', 'startDate', 'endDate', 'budget', 'targetAudience'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    }

    await campaign.save();

    return sendSuccess(res, { campaign }, 'Campaign updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/company/campaigns/:id
 * Delete a campaign
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
      status: { $ne: 'active' }
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found or cannot be deleted', HTTP_STATUS.NOT_FOUND, 'CAMPAIGN_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Campaign deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/campaigns
 * Admin: get all campaigns
 */
const adminGetCampaigns = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate('companyId', 'companyName email')
        .populate('advertisements')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(filter)
    ]);

    return sendPaginated(res, campaigns, total, page, limit, 'Campaigns retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/campaigns/:id/status
 * Admin: approve/reject campaign
 */
const adminUpdateCampaignStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['active', 'rejected', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return sendError(
        res,
        'Valid status is required (active/rejected/completed)',
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_STATUS'
      );
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return sendError(res, 'Campaign not found', HTTP_STATUS.NOT_FOUND, 'CAMPAIGN_NOT_FOUND');
    }

    campaign.status = status;
    if (status === 'rejected') {
      campaign.rejectionReason = rejectionReason || 'No specific reason provided';
    }
    await campaign.save();

    return sendSuccess(res, { campaign }, `Campaign ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCampaigns,
  getMyCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  adminGetCampaigns,
  adminUpdateCampaignStatus
};

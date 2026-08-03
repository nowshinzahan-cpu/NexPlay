const Platform = require('../models/Platform');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/platforms
 * Get all active platforms (public)
 */
const getActivePlatforms = async (req, res, next) => {
  try {
    const platforms = await Platform.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, platforms, 'Platforms retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/platforms
 * Admin: get all platforms with pagination
 */
const getPlatforms = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [platforms, total] = await Promise.all([
      Platform.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Platform.countDocuments()
    ]);

    return sendPaginated(res, platforms, total, page, limit, 'Platforms retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/platforms
 * Admin: create a new streaming platform
 */
const createPlatform = async (req, res, next) => {
  try {
    const { name, logo, website, description, supportedRegions, contentTypes } = req.body;

    if (!name) {
      return sendError(res, 'Platform name is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_NAME');
    }

    const existing = await Platform.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (existing) {
      return sendError(res, 'Platform already exists', HTTP_STATUS.CONFLICT, 'PLATFORM_EXISTS');
    }

    const platform = await Platform.create({
      name,
      logo: logo || '',
      website: website || '',
      description: description || '',
      supportedRegions: supportedRegions || [],
      contentTypes: contentTypes || ['ALL']
    });

    return sendSuccess(res, { platform }, 'Platform created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/platforms/:id
 * Admin: update a platform
 */
const updatePlatform = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'logo', 'website', 'description', 'supportedRegions', 'contentTypes', 'isActive'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const platform = await Platform.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!platform) {
      return sendError(res, 'Platform not found', HTTP_STATUS.NOT_FOUND, 'PLATFORM_NOT_FOUND');
    }

    return sendSuccess(res, { platform }, 'Platform updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/platforms/:id
 * Admin: delete a platform
 */
const deletePlatform = async (req, res, next) => {
  try {
    const platform = await Platform.findByIdAndDelete(req.params.id);
    if (!platform) {
      return sendError(res, 'Platform not found', HTTP_STATUS.NOT_FOUND, 'PLATFORM_NOT_FOUND');
    }
    return sendSuccess(res, {}, 'Platform deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivePlatforms,
  getPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform
};

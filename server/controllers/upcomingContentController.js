const { Content, Company } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/company/upcoming
 * Get company's upcoming content
 */
const getMyUpcomingContent = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {
      companyId: req.user.id,
      status: 'Upcoming'
    };

    const [contents, total] = await Promise.all([
      Content.find(filter)
        .sort({ releaseYear: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(filter)
    ]);

    return sendPaginated(res, contents, total, page, limit, 'Upcoming content retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/upcoming/all
 * Get ALL of company's content (released + upcoming)
 */
const getMyAllContent = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = { companyId: req.user.id };
    if (status) filter.status = status;

    const [contents, total] = await Promise.all([
      Content.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(filter)
    ]);

    return sendPaginated(res, contents, total, page, limit, 'Content retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company/upcoming
 * Create upcoming content (verified companies only)
 */
const createUpcomingContent = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.id);
    if (!company || company.verificationStatus !== 'verified') {
      return sendError(
        res,
        'Only verified companies can publish upcoming content',
        HTTP_STATUS.FORBIDDEN,
        'NOT_VERIFIED'
      );
    }

    const {
      title, originalTitle, type, description, poster, backdrop,
      genres, tags, spokenLanguage, releaseYear, platforms,
      episodeCount
    } = req.body;

    if (!title || !type) {
      return sendError(res, 'Title and type are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    const validTypes = ['MOVIE', 'TV_SERIES', 'WEB_SERIES', 'ANIME', 'DOCUMENTARY'];
    if (!validTypes.includes(type)) {
      return sendError(res, 'Type must be MOVIE, TV_SERIES, WEB_SERIES, ANIME, or DOCUMENTARY', HTTP_STATUS.BAD_REQUEST, 'INVALID_TYPE');
    }

    const content = await Content.create({
      title,
      originalTitle: originalTitle || '',
      type,
      description: description || '',
      poster: poster || '',
      backdrop: backdrop || '',
      genres: genres || [],
      tags: tags || [],
      spokenLanguage: spokenLanguage || 'English',
      releaseYear: releaseYear || new Date().getFullYear(),
      platforms: platforms || [],
      episodeCount: episodeCount || 0,
      status: 'Upcoming',
      companyId: req.user.id
    });

    return sendSuccess(res, { content }, 'Upcoming content published', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/company/upcoming/:id
 * Update upcoming content
 */
const updateUpcomingContent = async (req, res, next) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      companyId: req.user.id,
      status: 'Upcoming'
    });

    if (!content) {
      return sendError(res, 'Upcoming content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    const allowedFields = [
      'title', 'originalTitle', 'description', 'poster', 'backdrop',
      'genres', 'tags', 'spokenLanguage', 'releaseYear', 'platforms',
      'episodeCount'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        content[field] = req.body[field];
      }
    }

    await content.save();

    return sendSuccess(res, { content }, 'Upcoming content updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/company/upcoming/:id
 * Delete upcoming content
 */
const deleteUpcomingContent = async (req, res, next) => {
  try {
    const content = await Content.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
      status: 'Upcoming'
    });

    if (!content) {
      return sendError(res, 'Upcoming content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Upcoming content deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyUpcomingContent,
  getMyAllContent,
  createUpcomingContent,
  updateUpcomingContent,
  deleteUpcomingContent
};

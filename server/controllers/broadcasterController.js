const { Broadcaster, StreamAvailability } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/broadcasters
 * Get all active broadcasters (public)
 */
const getBroadcasters = async (req, res, next) => {
  try {
    const broadcasters = await Broadcaster.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, broadcasters, 'Broadcasters retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/broadcasters/all
 * Get all broadcasters including inactive (admin)
 */
const getAllBroadcasters = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [broadcasters, total] = await Promise.all([
      Broadcaster.find({})
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Broadcaster.countDocuments({})
    ]);

    return sendPaginated(res, broadcasters, total, page, limit, 'All broadcasters retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/broadcasters/:id
 * Get broadcaster by ID
 */
const getBroadcasterById = async (req, res, next) => {
  try {
    const broadcaster = await Broadcaster.findById(req.params.id).lean();
    if (!broadcaster) {
      return sendError(res, 'Broadcaster not found', HTTP_STATUS.NOT_FOUND, 'BROADCASTER_NOT_FOUND');
    }
    return sendSuccess(res, broadcaster, 'Broadcaster retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/broadcasters
 * Admin: create a broadcaster
 */
const createBroadcaster = async (req, res, next) => {
  try {
    const { name, logoUrl, website, regions, isOfficial } = req.body;

    if (!name) {
      return sendError(res, 'Broadcaster name is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    const existing = await Broadcaster.findOne({ name });
    if (existing) {
      return sendError(res, 'Broadcaster already exists', HTTP_STATUS.CONFLICT, 'DUPLICATE_BROADCASTER');
    }

    const broadcaster = await Broadcaster.create({
      name,
      logoUrl: logoUrl || '',
      website: website || '',
      regions: regions || [],
      isOfficial: isOfficial !== undefined ? isOfficial : true
    });

    return sendSuccess(res, { broadcaster }, 'Broadcaster created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/broadcasters/:id
 * Admin: update a broadcaster
 */
const updateBroadcaster = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'logoUrl', 'website', 'regions', 'isOfficial', 'isActive'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const broadcaster = await Broadcaster.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!broadcaster) {
      return sendError(res, 'Broadcaster not found', HTTP_STATUS.NOT_FOUND, 'BROADCASTER_NOT_FOUND');
    }

    return sendSuccess(res, { broadcaster }, 'Broadcaster updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/broadcasters/:id
 * Admin: delete a broadcaster
 */
const deleteBroadcaster = async (req, res, next) => {
  try {
    const broadcaster = await Broadcaster.findByIdAndDelete(req.params.id);
    if (!broadcaster) {
      return sendError(res, 'Broadcaster not found', HTTP_STATUS.NOT_FOUND, 'BROADCASTER_NOT_FOUND');
    }

    // Cascade cleanup
    await StreamAvailability.deleteMany({ broadcasterId: broadcaster._id });

    return sendSuccess(res, {}, 'Broadcaster deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/:id/streams
 * Get stream availability for a match
 */
const getMatchStreams = async (req, res, next) => {
  try {
    const { region } = req.query;
    let resolvedRegion = region || 'US';

    const filter = { matchId: req.params.id };
    if (resolvedRegion) {
      filter.region = resolvedRegion;
    }

    const streams = await StreamAvailability.find(filter)
      .populate('broadcasterId', 'name logoUrl website isOfficial')
      .lean();

    return sendSuccess(res, streams, 'Streams retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/streams
 * Admin: create stream availability
 */
const createStream = async (req, res, next) => {
  try {
    const { matchId, broadcasterId, region, url, isOfficial, isFree, quality, language } = req.body;

    if (!matchId || !broadcasterId || !region || !url) {
      return sendError(
        res,
        'Match ID, broadcaster ID, region, and URL are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    const stream = await StreamAvailability.create({
      matchId, broadcasterId, region, url,
      isOfficial: isOfficial !== undefined ? isOfficial : true,
      isFree: isFree || false,
      quality: quality || 'HD',
      language: language || 'English'
    });

    return sendSuccess(res, { stream }, 'Stream created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/streams/:id
 * Admin: delete stream availability
 */
const deleteStream = async (req, res, next) => {
  try {
    const stream = await StreamAvailability.findByIdAndDelete(req.params.id);
    if (!stream) {
      return sendError(res, 'Stream not found', HTTP_STATUS.NOT_FOUND, 'STREAM_NOT_FOUND');
    }
    return sendSuccess(res, {}, 'Stream deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBroadcasters,
  getAllBroadcasters,
  getBroadcasterById,
  createBroadcaster,
  updateBroadcaster,
  deleteBroadcaster,
  getMatchStreams,
  createStream,
  deleteStream
};

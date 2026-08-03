const Sport = require('../models/Sport');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination, parseSearchQuery } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/sports
 * Get sports events with filtering
 */
const getSports = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { sportType, status, search, tournament } = req.query;

    const filter = { isActive: true };

    if (sportType) filter.sportType = sportType;
    if (status) filter.status = status;
    if (tournament) filter.tournamentName = parseSearchQuery(tournament);
    if (search) {
      const escaped = parseSearchQuery(search);
      filter.$or = [
        { title: escaped },
        { homeTeam: escaped },
        { awayTeam: escaped },
        { tournamentName: escaped }
      ];
    }

    const [events, total] = await Promise.all([
      Sport.find(filter)
        .sort({ status: 1, startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sport.countDocuments(filter)
    ]);

    return sendPaginated(res, events, total, page, limit, 'Sports events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sports/live
 * Get currently live sports events
 */
const getLiveSports = async (req, res, next) => {
  try {
    const events = await Sport.find({ isActive: true, status: 'Live' })
      .sort({ startDate: -1 })
      .lean();

    return sendSuccess(res, events, 'Live sports events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sports/upcoming
 * Get upcoming sports events
 */
const getUpcomingSports = async (req, res, next) => {
  try {
    const events = await Sport.find({ isActive: true, status: 'Upcoming' })
      .sort({ startDate: 1 })
      .limit(30)
      .lean();

    return sendSuccess(res, events, 'Upcoming sports events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sports/completed
 * Get completed sports results
 */
const getCompletedSports = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { sportType } = req.query;

    const filter = { isActive: true, status: 'Completed' };
    if (sportType) filter.sportType = sportType;

    const [events, total] = await Promise.all([
      Sport.find(filter)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sport.countDocuments(filter)
    ]);

    return sendPaginated(res, events, total, page, limit, 'Completed sports events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sports/types
 * Get available sport types
 */
const getSportTypes = async (req, res, next) => {
  try {
    const types = await Sport.distinct('sportType', { isActive: true });
    return sendSuccess(res, types, 'Sport types retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sports/:id
 * Get single sports event
 */
const getSportById = async (req, res, next) => {
  try {
    const event = await Sport.findById(req.params.id).lean();
    if (!event) {
      return sendError(res, 'Sports event not found', HTTP_STATUS.NOT_FOUND, 'SPORT_NOT_FOUND');
    }
    return sendSuccess(res, event, 'Sports event retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sports (admin only)
 * Create a new sports event
 */
const createSport = async (req, res, next) => {
  try {
    const {
      title, sportType, tournamentName, homeTeam, awayTeam,
      homeScore, awayScore, status, startDate, endDate,
      venue, streamingLinks, poster, description
    } = req.body;

    if (!title || !sportType || !homeTeam || !awayTeam || !startDate) {
      return sendError(res, 'Title, sport type, teams, and start date are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    const event = await Sport.create({
      title, sportType, tournamentName: tournamentName || '',
      homeTeam, awayTeam, homeScore: homeScore || 0, awayScore: awayScore || 0,
      status: status || 'Upcoming', startDate, endDate: endDate || null,
      venue: venue || '', streamingLinks: streamingLinks || [],
      poster: poster || '', description: description || ''
    });

    return sendSuccess(res, { sport: event }, 'Sports event created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sports/:id (admin only)
 * Update a sports event (e.g., update live scores)
 */
const updateSport = async (req, res, next) => {
  try {
    const allowedFields = [
      'title', 'sportType', 'tournamentName', 'homeTeam', 'awayTeam',
      'homeScore', 'awayScore', 'status', 'startDate', 'endDate',
      'venue', 'streamingLinks', 'poster', 'description'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const event = await Sport.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!event) {
      return sendError(res, 'Sports event not found', HTTP_STATUS.NOT_FOUND, 'SPORT_NOT_FOUND');
    }

    return sendSuccess(res, { sport: event }, 'Sports event updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sports/:id (admin only)
 * Delete a sports event
 */
const deleteSport = async (req, res, next) => {
  try {
    const event = await Sport.findByIdAndDelete(req.params.id);
    if (!event) {
      return sendError(res, 'Sports event not found', HTTP_STATUS.NOT_FOUND, 'SPORT_NOT_FOUND');
    }
    return sendSuccess(res, {}, 'Sports event deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSports,
  getLiveSports,
  getUpcomingSports,
  getCompletedSports,
  getSportTypes,
  getSportById,
  createSport,
  updateSport,
  deleteSport
};

const { Match, MatchEvent, Standing, Lineup, Favorite, Notification } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { emitScoreUpdate, emitMatchUpdate, sendUserNotification } = require('../socket');
const logger = require('../utils/logger');

/**
 * GET /api/matches/live
 * Get matches currently in progress
 */
const getLiveMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      isActive: true,
      status: { $in: ['live', 'halftime'] }
    })
      .sort({ minute: -1, kickoffTime: -1 })
      .lean();

    return sendSuccess(res, matches, 'Live matches retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/today
 * Get today's matches
 */
const getTodayMatches = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const matches = await Match.find({
      isActive: true,
      kickoffTime: { $gte: today, $lt: tomorrow }
    })
      .sort({ kickoffTime: 1 })
      .lean();

    return sendSuccess(res, matches, 'Today matches retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/upcoming
 * Get upcoming matches with filters
 */
const getUpcomingMatches = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { competition, team, from, to, sportType } = req.query;

    const filter = { isActive: true, status: 'scheduled' };

    if (competition) filter.competition = competition;
    if (sportType) filter.sportType = sportType;

    if (from || to) {
      filter.kickoffTime = {};
      if (from) filter.kickoffTime.$gte = new Date(from);
      if (to) filter.kickoffTime.$lte = new Date(to);
    }

    if (team) {
      filter.$or = [
        { homeTeam: { $regex: team, $options: 'i' } },
        { awayTeam: { $regex: team, $options: 'i' } }
      ];
    }

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .sort({ kickoffTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Match.countDocuments(filter)
    ]);

    return sendPaginated(res, matches, total, page, limit, 'Upcoming matches retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/:id
 * Get full match detail with lineup, timeline, stats
 */
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).lean();
    if (!match) {
      return sendError(res, 'Match not found', HTTP_STATUS.NOT_FOUND, 'MATCH_NOT_FOUND');
    }

    const [events, lineups] = await Promise.all([
      MatchEvent.find({ matchId: match._id }).sort({ minute: 1 }).lean(),
      Lineup.find({ matchId: match._id }).lean()
    ]);

    return sendSuccess(res, {
      ...match,
      events,
      lineups
    }, 'Match details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches (admin)
 * Create a new match
 */
const createMatch = async (req, res, next) => {
  try {
    const {
      homeTeam, awayTeam, competition, sportType,
      kickoffTime, venue, referee, status
    } = req.body;

    if (!homeTeam || !awayTeam || !competition || !sportType || !kickoffTime) {
      return sendError(
        res,
        'Home team, away team, competition, sport type, and kickoff time are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    const match = await Match.create({
      homeTeam, awayTeam, competition, sportType,
      kickoffTime: new Date(kickoffTime),
      venue: venue || '',
      referee: referee || '',
      status: status || 'scheduled'
    });

    return sendSuccess(res, { match }, 'Match created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/matches/:id (admin)
 * Update match details (e.g., score, status, stats)
 */
const updateMatch = async (req, res, next) => {
  try {
    const allowedFields = [
      'homeScore', 'awayScore', 'status', 'minute',
      'venue', 'referee', 'kickoffTime', 'stats'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!match) {
      return sendError(res, 'Match not found', HTTP_STATUS.NOT_FOUND, 'MATCH_NOT_FOUND');
    }

    // Emit real-time score update
    emitScoreUpdate(match._id, match.homeScore, match.awayScore, match.minute);

    // Emit status change
    if (updateData.status) {
      emitMatchUpdate(match._id, 'status', { status: match.status });
    }

    return sendSuccess(res, { match }, 'Match updated');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/events (admin)
 * Add an event to a match
 */
const addMatchEvent = async (req, res, next) => {
  try {
    const { minute, type, team, playerName, assistedBy, description } = req.body;

    if (!minute || !type || !team) {
      return sendError(
        res,
        'Minute, type, and team are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      return sendError(res, 'Match not found', HTTP_STATUS.NOT_FOUND, 'MATCH_NOT_FOUND');
    }

    const event = await MatchEvent.create({
      matchId: match._id,
      minute,
      type,
      team,
      playerName: playerName || '',
      assistedBy: assistedBy || '',
      description: description || ''
    });

    // Update match stats based on event type
    const statsUpdate = {};
    if (type === 'goal') {
      if (team === 'home') {
        match.homeScore += 1;
        statsUpdate.homeShotsOnTarget = (match.stats.homeShotsOnTarget || 0) + 1;
      } else {
        match.awayScore += 1;
        statsUpdate.awayShotsOnTarget = (match.stats.awayShotsOnTarget || 0) + 1;
      }
    } else if (type === 'yellow_card') {
      if (team === 'home') statsUpdate.homeYellowCards = (match.stats.homeYellowCards || 0) + 1;
      else statsUpdate.awayYellowCards = (match.stats.awayYellowCards || 0) + 1;
    } else if (type === 'red_card') {
      if (team === 'home') statsUpdate.homeRedCards = (match.stats.homeRedCards || 0) + 1;
      else statsUpdate.awayRedCards = (match.stats.awayRedCards || 0) + 1;
    } else if (type === 'corner') {
      if (team === 'home') statsUpdate.homeCorners = (match.stats.homeCorners || 0) + 1;
      else statsUpdate.awayCorners = (match.stats.awayCorners || 0) + 1;
    }

    if (Object.keys(statsUpdate).length > 0) {
      Object.entries(statsUpdate).forEach(([key, val]) => {
        match.stats[key] = val;
      });
    }

    match.minute = Math.max(match.minute, minute);
    await match.save();

    // Emit real-time updates
    emitMatchUpdate(match._id, 'event', { event });
    emitScoreUpdate(match._id, match.homeScore, match.awayScore, match.minute);

    // Create match-event notifications for users who favorited either team
    if (type === 'goal' || type === 'red_card' || type === 'halftime' || type === 'fulltime') {
      createMatchEventNotifications(match, event, type).catch(() => {});
    }

    return sendSuccess(res, { event, match }, 'Event added', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * Create match-event notifications for users who favorited the teams involved.
 * Called after significant match events (goals, red cards, halftime, fulltime).
 */
async function createMatchEventNotifications(match, event, eventType) {
  try {
    // Find users who favorited either team
    const favorites = await Favorite.find({
      type: 'team',
      $or: [
        { refName: match.homeTeam },
        { refName: match.awayTeam }
      ]
    }).lean();

    if (!favorites.length) return;

    const userIds = [...new Set(favorites.map(f => f.userId.toString()))];

    let title, message, notifType;
    const scoringTeam = event.team === 'home' ? match.homeTeam : match.awayTeam;
    const otherTeam = event.team === 'home' ? match.awayTeam : match.homeTeam;

    if (eventType === 'goal') {
      title = `⚽ Goal! ${scoringTeam} scores!`;
      message = `${scoringTeam} ${match.homeScore}-${match.awayScore} ${otherTeam} — ${event.playerName} (${event.minute}')`;
      notifType = 'goal_alert';
    } else if (eventType === 'red_card') {
      title = `🟥 Red card for ${scoringTeam}`;
      message = `${event.playerName} has been sent off (${event.minute}')`;
      notifType = 'match_event';
    } else if (eventType === 'halftime') {
      title = `⏸️ Halftime: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
      message = `The first half is over in the ${match.competition} match.`;
      notifType = 'match_event';
    } else if (eventType === 'fulltime') {
      title = `🏁 Full Time: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
      message = `The ${match.competition} match has ended.`;
      notifType = 'match_event';
    } else {
      return;
    }

    const notifications = userIds.map(userId => ({
      recipientId: userId,
      recipientType: 'User',
      type: notifType,
      title,
      message,
      link: `/matches/${match._id}`,
      relatedMatchId: match._id
    }));

    const created = await Notification.insertMany(notifications);

    // Push to connected clients via socket
    for (const notif of created) {
      sendUserNotification(notif.recipientId, notif);
    }
  } catch (error) {
    logger.error(`Failed to create match event notifications: ${error.message}`);
  }
}

/**
 * GET /api/standings/:competitionId
 * Get standings for a competition
 */
const getStandings = async (req, res, next) => {
  try {
    const standings = await Standing.find({
      competition: req.params.competitionId
    })
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 })
      .lean();

    return sendSuccess(res, standings, 'Standings retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/standings (admin)
 * Create or update a standing entry
 */
const upsertStanding = async (req, res, next) => {
  try {
    const standing = await Standing.findOneAndUpdate(
      { competition: req.body.competition, teamName: req.body.teamName },
      { $set: req.body },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return sendSuccess(res, { standing }, 'Standing updated', standing ? HTTP_STATUS.OK : HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLiveMatches,
  getTodayMatches,
  getUpcomingMatches,
  getMatchById,
  createMatch,
  updateMatch,
  addMatchEvent,
  getStandings,
  upsertStanding
};

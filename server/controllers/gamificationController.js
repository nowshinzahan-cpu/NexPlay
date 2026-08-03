const { UserStats, PointsLedger, Badge, UserBadge } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { getLevelProgress } = require('../models/levels.config');
const mongoose = require('mongoose');

/**
 * GET /api/leaderboard
 * Get leaderboard with range filter
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { range = 'allTime' } = req.query;

    let sortField = 'points';
    let matchFilter = {};

    if (range === 'weekly') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get weekly points from ledger
      const weeklyPoints = await PointsLedger.aggregate([
        { $match: { weekStart: { $gte: weekStart } } },
        { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
        { $sort: { totalPoints: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const userIds = weeklyPoints.map(w => w._id);
      const users = await UserStats.find({ userId: { $in: userIds } })
        .populate('userId', 'fullName username avatar')
        .lean();

      // Map users to include weekly points
      const leaderboard = weeklyPoints.map((wp, index) => {
        const userStats = users.find(u => u.userId?._id?.toString() === wp._id.toString());
        return {
          rank: skip + index + 1,
          user: userStats?.userId || { _id: wp._id },
          points: wp.totalPoints,
          level: userStats?.level || 1,
          totalPoints: userStats?.points || 0
        };
      });

      const total = await UserStats.countDocuments({});

      return sendPaginated(res, leaderboard, total, page, limit, 'Leaderboard retrieved');
    }

    if (range === 'monthly') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyPoints = await PointsLedger.aggregate([
        { $match: { monthStart: { $gte: monthStart } } },
        { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
        { $sort: { totalPoints: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const userIds = monthlyPoints.map(w => w._id);
      const users = await UserStats.find({ userId: { $in: userIds } })
        .populate('userId', 'fullName username avatar')
        .lean();

      const leaderboard = monthlyPoints.map((mp, index) => {
        const userStats = users.find(u => u.userId?._id?.toString() === mp._id.toString());
        return {
          rank: skip + index + 1,
          user: userStats?.userId || { _id: mp._id },
          points: mp.totalPoints,
          level: userStats?.level || 1,
          totalPoints: userStats?.points || 0
        };
      });

      const total = await UserStats.countDocuments({});

      return sendPaginated(res, leaderboard, total, page, limit, 'Leaderboard retrieved');
    }

    // All-time leaderboard
    const [leaderboard, total] = await Promise.all([
      UserStats.find(matchFilter)
        .populate('userId', 'fullName username avatar')
        .sort({ points: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserStats.countDocuments(matchFilter)
    ]);

    const ranked = leaderboard.map((stats, index) => ({
      rank: skip + index + 1,
      user: stats.userId,
      points: stats.points,
      level: stats.level,
      totalReviews: stats.totalReviews,
      totalDiscussions: stats.totalDiscussions
    }));

    return sendPaginated(res, ranked, total, page, limit, 'Leaderboard retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/stats
 * Get current user's gamification stats
 */
const getUserStats = async (req, res, next) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id }).lean();
    if (!stats) {
      stats = { userId: req.user.id, points: 0, level: 1 };
    }

    const levelProgress = getLevelProgress(stats.points || 0);

    const badges = await UserBadge.find({ userId: req.user.id })
      .populate('badgeId', 'key name description iconUrl category')
      .sort({ earnedAt: -1 })
      .lean();

    return sendSuccess(res, {
      stats,
      levelProgress,
      badges: badges.map(b => ({
        ...b.badgeId,
        earnedAt: b.earnedAt
      }))
    }, 'User stats retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/badges
 * Get all available badges
 */
const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .lean();

    return sendSuccess(res, badges, 'Badges retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/points-history
 * Get paginated points history for current user
 */
const getPointsHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { userId: req.user.id };

    const [ledger, total] = await Promise.all([
      PointsLedger.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PointsLedger.countDocuments(filter)
    ]);

    return sendPaginated(res, ledger, total, page, limit, 'Points history retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getUserStats,
  getAllBadges,
  getPointsHistory
};

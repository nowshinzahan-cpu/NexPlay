const { UserStats, UserBadge, Badge, PointsLedger, User } = require('../models');
const { ACTION_POINTS, calculateLevel, getLevelProgress } = require('../models/levels.config');
const { emitGamificationEvent } = require('../socket');
const logger = require('../utils/logger');

/**
 * Award points to a user for an action.
 * This is the single internal entry point for all gamification.
 * Called from other modules' controllers/services.
 */
async function awardPoints(userId, action, refId = null, refModel = null) {
  try {
    const points = ACTION_POINTS[action];
    if (!points) {
      logger.warn(`Unknown action type for points: ${action}`);
      return null;
    }

    // Get or create user stats
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    // Record in ledger
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    await PointsLedger.create({
      userId,
      action,
      points,
      refId,
      refModel,
      description: `${action} - ${points} points`,
      weekStart,
      monthStart
    });

    // Update stats
    stats.points += points;
    stats.currentWeekPoints += points;
    stats.currentMonthPoints += points;

    // Update action-specific counters
    switch (action) {
      case 'review_created': stats.totalReviews += 1; break;
      case 'discussion_created': stats.totalDiscussions += 1; break;
      case 'comment_created': stats.totalComments += 1; break;
      case 'favorite_added': stats.totalFavorites += 1; break;
    }

    // Check level
    const oldLevel = stats.level;
    const newLevelInfo = calculateLevel(stats.points);
    const leveledUp = newLevelInfo.level > oldLevel;

    if (leveledUp) {
      stats.level = newLevelInfo.level;
    }

    await stats.save();

    // Emit gamification event
    const event = {
      userId,
      action,
      points,
      totalPoints: stats.points,
      level: stats.level,
      leveledUp,
      newLevelTitle: leveledUp ? newLevelInfo.title : undefined
    };
    emitGamificationEvent(userId, event);

    // Check and award badges
    await checkAndAwardBadges(userId, action, stats);

    // Create notification for level up
    if (leveledUp) {
      const { Notification } = require('../models');
      await Notification.create({
        recipientId: userId,
        recipientType: 'User',
        type: 'system',
        title: `Level Up! You're now Level ${newLevelInfo.level}`,
        message: `Congratulations! You've reached "${newLevelInfo.title}" level with ${stats.points} points.`,
        link: '/user/profile'
      });
      emitGamificationEvent(userId, { ...event, type: 'level_up' });
    }

    return event;
  } catch (error) {
    logger.error(`Failed to award points: ${error.message}`);
    return null;
  }
}

/**
 * Check and award badges based on user activity.
 */
async function checkAndAwardBadges(userId, action, stats) {
  try {
    const badges = await Badge.find({ isActive: true }).lean();

    for (const badge of badges) {
      // Check if user already has this badge
      const existing = await UserBadge.findOne({ userId, badgeId: badge._id });
      if (existing) continue;

      let earned = false;

      switch (badge.key) {
        case 'first_review':
          earned = action === 'review_created' && stats.totalReviews >= 1;
          break;
        case 'critic':
          earned = stats.totalReviews >= 5;
          break;
        case 'review_master':
          earned = stats.totalReviews >= 10;
          break;
        case 'first_discussion':
          earned = action === 'discussion_created' && stats.totalDiscussions >= 1;
          break;
        case 'first_comment':
          earned = action === 'comment_created' && stats.totalComments >= 1;
          break;
        case 'discussion_starter':
          earned = stats.totalDiscussions >= 5;
          break;
        case 'popular_commenter':
          earned = stats.totalComments >= 25;
          break;
        case 'super_fan':
          earned = stats.totalFavorites >= 10;
          break;
        case 'centurion':
          earned = stats.points >= 100;
          break;
        case 'level_5':
          earned = stats.level >= 5;
          break;
        case 'level_10':
          earned = stats.level >= 10;
          break;
        case 'streak_3':
          earned = stats.loginStreak >= 3;
          break;
        case 'streak_7':
          earned = stats.loginStreak >= 7;
          break;
        case 'streak_30':
          earned = stats.loginStreak >= 30;
          break;
        default:
          break;
      }

      if (earned) {
        // Award badge
        await UserBadge.create({ userId, badgeId: badge._id });

        // Award points for badge
        if (badge.pointsAwarded > 0) {
          await awardPoints(userId, 'badge_earned', badge._id, 'Badge');
        }

        // Create notification
        const { Notification } = require('../models');
        await Notification.create({
          recipientId: userId,
          recipientType: 'User',
          type: 'system',
          title: 'Badge Unlocked!',
          message: `You've earned the "${badge.name}" badge: ${badge.description}`,
          link: '/user/profile'
        });

        emitGamificationEvent(userId, {
          type: 'badge_earned',
          badge: {
            key: badge.key,
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl
          }
        });
      }
    }
  } catch (error) {
    logger.error(`Failed to check badges: ${error.message}`);
  }
}

/**
 * Record daily login and update streak
 */
async function recordLogin(userId) {
  try {
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (stats.lastLoginDate) {
      const lastLogin = new Date(stats.lastLoginDate);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

      if (lastLoginDay.getTime() === today.getTime()) {
        return;
      }

      if (lastLoginDay.getTime() === yesterday.getTime()) {
        stats.loginStreak += 1;
        stats.longestStreak = Math.max(stats.longestStreak, stats.loginStreak);
        await awardPoints(userId, 'login_streak', null);
      } else {
        stats.loginStreak = 1;
      }
    } else {
      stats.loginStreak = 1;
    }

    stats.lastLoginDate = now;
    await stats.save();

    await awardPoints(userId, 'daily_login', null);
  } catch (error) {
    logger.error(`Failed to record login: ${error.message}`);
  }
}

module.exports = {
  awardPoints,
  recordLogin,
  checkAndAwardBadges
};

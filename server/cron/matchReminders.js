/**
 * Match Reminder Cron — checks upcoming matches for users' favorited teams
 * and creates reminder notifications at the configured interval before kickoff.
 *
 * Uses node-cron schedule: runs every 15 minutes.
 */
const cron = require('node-cron');
const { Favorite, Notification, NotificationPreference, Match } = require('../models');
const logger = require('../utils/logger');

const FIFTEEN_MINUTES = '*/15 * * * *';

/**
 * Process match reminders for all users who have favorited teams
 * playing in upcoming matches.
 */
async function processMatchReminders() {
  try {
    // Get all upcoming matches within the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingMatches = await Match.find({
      status: 'scheduled',
      kickoffTime: { $gte: now, $lte: tomorrow },
      isActive: true
    }).lean();

    if (upcomingMatches.length === 0) return;

    // Get all users who have favorited teams
    const favorites = await Favorite.find({
      type: 'team',
      refName: { $ne: '' }
    }).lean();

    if (favorites.length === 0) return;

    // Group favorites by team name
    const teamFavorites = {};
    favorites.forEach(fav => {
      if (!teamFavorites[fav.refName]) teamFavorites[fav.refName] = [];
      teamFavorites[fav.refName].push(fav.userId);
    });

    // Check each match for favorited teams
    for (const match of upcomingMatches) {
      const homeFans = teamFavorites[match.homeTeam] || [];
      const awayFans = teamFavorites[match.awayTeam] || [];
      const allFans = [...new Set([...homeFans, ...awayFans])];

      if (allFans.length === 0) continue;

      const minutesUntilKickoff = (match.kickoffTime.getTime() - now.getTime()) / 60000;

      // Check each fan's notification preferences
      for (const userId of allFans) {
        const prefs = await NotificationPreference.findOne({ userId }).lean();

        if (!prefs || !prefs.matchReminders) continue;

        const reminderMinutes = prefs.reminderMinutesBefore || 30;

        // Check if the reminder time is close enough (within the check window)
        if (minutesUntilKickoff > reminderMinutes && minutesUntilKickoff <= reminderMinutes + 15) {
          // Check if reminder notification already exists
          const existingReminder = await Notification.findOne({
            recipientId: userId,
            recipientType: 'User',
            type: 'system',
            title: { $regex: `Reminder: ${match.homeTeam} vs ${match.awayTeam}` }
          }).lean();

          if (existingReminder) continue;

          // Create reminder notification
          await Notification.create({
            recipientId: userId,
            recipientType: 'User',
            type: 'system',
            title: `Reminder: ${match.homeTeam} vs ${match.awayTeam} starts soon!`,
            message: `${match.competition} — Kickoff in ${reminderMinutes} minutes at ${match.venue || 'TBD'}`,
            link: `/matches/${match._id}`
          });

          logger.info(`Match reminder created for user ${userId}: ${match.homeTeam} vs ${match.awayTeam}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Match reminder cron error: ${error.message}`);
  }
}

/**
 * Initialize match reminder cron job.
 */
function initializeMatchReminders() {
  cron.schedule(FIFTEEN_MINUTES, () => {
    processMatchReminders();
  });

  logger.info('Match reminder cron scheduled (every 15 minutes)');

  // Run once on startup
  setTimeout(() => {
    processMatchReminders();
  }, 20000);
}

module.exports = { initializeMatchReminders, processMatchReminders };

/**
 * Sports Sync Scheduler — periodically fetches live sports data from external APIs
 * and updates the Sport model in the database.
 *
 * Implements:
 *   FR-64: "Live sports information shall be updated automatically through external Sports APIs."
 *   FR-68: "The system shall provide up-to-date match schedules and scores."
 *
 * Uses setInterval instead of node-cron to avoid an extra dependency.
 * Runs live score sync every 5 minutes and upcoming matches sync every 30 minutes.
 * Also runs once on server startup to load initial data.
 */
const logger = require('../utils/logger');
const { syncLiveSports, fetchUpcomingMatches } = require('../services/sportsApiService');
const Sport = require('../models/Sport');

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const STARTUP_DELAY = 10000;

/**
 * Sync live scores into the database.
 * Called by the scheduler and on startup.
 */
const runSyncLiveScores = async () => {
  try {
    await syncLiveSports();
  } catch (error) {
    logger.error(`Sports sync error: ${error.message}`);
  }
};

/**
 * Sync upcoming matches into the database.
 * Runs less frequently since schedules don't change as often.
 */
const runSyncUpcomingMatches = async () => {
  try {
    const upcomingData = await fetchUpcomingMatches('all');
    if (!upcomingData || upcomingData.length === 0) return;

    for (const event of upcomingData) {
      if (event.status === 'Upcoming') {
        await Sport.findOneAndUpdate(
          {
            homeTeam: event.homeTeam,
            awayTeam: event.awayTeam,
            startDate: event.startDate
          },
          { $set: event },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
    logger.info(`Synced ${upcomingData.length} upcoming sports events`);
  } catch (error) {
    logger.error(`Upcoming matches sync error: ${error.message}`);
  }
};

/**
 * Initialize the sports sync schedulers.
 * Called once during server startup.
 */
const initializeSportsCron = () => {
  // Schedule live score sync every 5 minutes
  setInterval(() => {
    runSyncLiveScores();
  }, FIVE_MINUTES);

  // Schedule upcoming matches sync every 30 minutes
  setInterval(() => {
    runSyncUpcomingMatches();
  }, THIRTY_MINUTES);

  logger.info('Sports sync schedulers started (live: every 5 min, upcoming: every 30 min)');

  // Run initial sync on startup (with a delay to let the server fully initialize)
  setTimeout(() => {
    runSyncLiveScores();
    runSyncUpcomingMatches();
  }, STARTUP_DELAY);
};

module.exports = { initializeSportsCron };

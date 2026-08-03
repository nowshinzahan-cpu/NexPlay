/**
 * Sports API Service — fetches live sports data from external APIs.
 * Falls back to static data if API key is not configured.
 */
const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const Sport = require('../models/Sport');

let sportsApiAvailable = false;

const initializeSportsAPI = () => {
  if (config.sportsApiKey) {
    sportsApiAvailable = true;
    logger.info('Sports API service initialized');
  } else {
    logger.warn('Sports API key not configured — using static sports data only');
  }
};

/**
 * Fetch live scores from the configured sports API provider.
 * Supports: api-sports.io, thesportsdb, or a generic fallback.
 */
const fetchLiveScores = async () => {
  if (!sportsApiAvailable) return null;

  try {
    // Using api-sports.io format (common provider)
    const response = await axios.get('https://v1.baseball.api-sports.io/live', {
      headers: {
        'x-rapidapi-key': config.sportsApiKey,
        'x-rapidapi-host': 'v1.baseball.api-sports.io'
      },
      timeout: 8000
    });

    if (response.data && response.data.response) {
      return transformSportsData(response.data.response);
    }
    return null;
  } catch (error) {
    logger.warn(`Sports API error (live): ${error.message}`);
    return null;
  }
};

/**
 * Fetch upcoming matches/schedules
 */
const fetchUpcomingMatches = async (sportType = 'all') => {
  if (!sportsApiAvailable) return null;

  try {
    const params = {};
    if (sportType !== 'all') params.sport = sportType;

    const response = await axios.get('https://v1.baseball.api-sports.io/games', {
      params: { date: new Date().toISOString().split('T')[0], ...params },
      headers: {
        'x-rapidapi-key': config.sportsApiKey,
        'x-rapidapi-host': 'v1.baseball.api-sports.io'
      },
      timeout: 8000
    });

    if (response.data && response.data.response) {
      return transformSportsData(response.data.response);
    }
    return null;
  } catch (error) {
    logger.warn(`Sports API error (upcoming): ${error.message}`);
    return null;
  }
};

/**
 * Transform external API response to match our Sport model schema
 */
const transformSportsData = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    title: `${item.teams?.home?.name || 'Home'} vs ${item.teams?.away?.name || 'Away'}`,
    sportType: item.sport || mapLeagueToSport(item.league),
    tournamentName: item.league?.name || '',
    homeTeam: item.teams?.home?.name || 'Home',
    awayTeam: item.teams?.away?.name || 'Away',
    homeScore: item.scores?.home || 0,
    awayScore: item.scores?.away || 0,
    status: item.status?.short === 'LIVE' ? 'Live' : 
            item.status?.short === 'FT' ? 'Completed' : 'Upcoming',
    startDate: item.date ? new Date(item.date) : new Date(),
    venue: item.venue?.name || '',
    streamingLinks: [],
    isActive: true
  }));
};

const mapLeagueToSport = (league) => {
  if (!league) return 'Other';
  const name = (league.name || '').toLowerCase();
  if (name.includes('football') || name.includes('soccer') || name.includes('epl')) return 'Football';
  if (name.includes('cricket') || name.includes('ipl')) return 'Cricket';
  if (name.includes('basketball') || name.includes('nba')) return 'Basketball';
  if (name.includes('tennis') || name.includes('wimbledon')) return 'Tennis';
  if (name.includes('baseball') || name.includes('mlb')) return 'Baseball';
  if (name.includes('hockey') || name.includes('nhl')) return 'Hockey';
  return 'Other';
};

/**
 * Sync live sports data into the database
 * This is called periodically by the cron job to keep sports data fresh.
 */
const syncLiveSports = async () => {
  const liveData = await fetchLiveScores();
  if (!liveData || liveData.length === 0) {
    logger.info('No live sports data to sync');
    return;
  }

  // Mark existing live events as completed if they're no longer live
  await Sport.updateMany(
    { status: 'Live' },
    { $set: { status: 'Completed' } }
  );

  // Insert/update live events
  for (const event of liveData) {
    await Sport.findOneAndUpdate(
      {
        homeTeam: event.homeTeam,
        awayTeam: event.awayTeam,
        status: 'Live'
      },
      { $set: event },
      { upsert: true, returnDocument: 'after' }
    );
  }

  logger.info(`Synced ${liveData.length} live sports events`);
};

module.exports = {
  initializeSportsAPI,
  fetchLiveScores,
  fetchUpcomingMatches,
  syncLiveSports
};

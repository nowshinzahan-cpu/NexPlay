/**
 * TMDB API Service — fetches real movie/TV data from The Movie Database API.
 * Falls back gracefully if API key is not configured.
 */
const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

let tmdbAvailable = false;

const initializeTMDB = () => {
  if (config.tmdbApiKey) {
    tmdbAvailable = true;
    logger.info('TMDB API service initialized');
  } else {
    logger.warn('TMDB API key not configured — using static data only');
  }
};

const tmdbRequest = async (endpoint, params = {}) => {
  if (!tmdbAvailable) return null;
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: config.tmdbApiKey,
        language: 'en-US',
        ...params
      },
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    logger.warn(`TMDB API error (${endpoint}): ${error.message}`);
    return null;
  }
};

/**
 * Get streaming availability for a movie/TV show
 * @param {number} tmdbId - TMDB content ID
 * @param {string} type - 'movie' or 'tv'
 * @returns {Array} List of streaming platforms with pricing info
 */
const getStreamingAvailability = async (tmdbId, type = 'movie') => {
  const data = await tmdbRequest(`/${type}/${tmdbId}/watch/providers`);
  if (!data || !data.results) return [];

  const providers = [];
  const regions = data.results;

  // Extract US providers with pricing info
  const usProviders = regions['US'];
  if (!usProviders) return [];

  // Flatrate = subscription, rent = rental, buy = purchase, free = free
  const categories = [
    { key: 'flatrate', label: 'Subscription' },
    { key: 'rent', label: 'Rental' },
    { key: 'buy', label: 'Purchase' },
    { key: 'free', label: 'Free' }
  ];

  categories.forEach(({ key, label }) => {
    (usProviders[key] || []).forEach(provider => {
      providers.push({
        providerName: provider.provider_name,
        providerId: provider.provider_id,
        logo: provider.logo_path ? `${TMDB_IMAGE_BASE}/w92${provider.logo_path}` : '',
        availabilityType: label,
        link: `https://www.themoviedb.org/${type}/${tmdbId}/watch?provider_id=${provider.provider_id}`
      });
    });
  });

  return providers;
};

/**
 * Search TMDB for movies/TV shows
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Array} Search results
 */
const searchTMDB = async (query, page = 1) => {
  return tmdbRequest('/search/multi', { query, page });
};

/**
 * Get trending content from TMDB
 * @param {string} timeWindow - 'day' or 'week'
 * @returns {Array} Trending items
 */
const getTrendingFromTMDB = async (timeWindow = 'week') => {
  return tmdbRequest(`/trending/all/${timeWindow}`);
};

/**
 * Get content details with posters and backdrops
 */
const enrichContentWithTMDB = async (title, type, year) => {
  if (!tmdbAvailable) return null;
  const searchType = type === 'MOVIE' ? 'movie' : 'tv';
  const results = await tmdbRequest(`/search/${searchType}`, {
    query: title,
    year: year || undefined
  });

  if (!results || !results.results || results.results.length === 0) return null;

  const item = results.results[0];
  return {
    tmdbId: item.id,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : '',
    overview: item.overview || '',
    voteAverage: item.vote_average || 0,
    genres: item.genre_ids || []
  };
};

module.exports = {
  initializeTMDB,
  getStreamingAvailability,
  searchTMDB,
  getTrendingFromTMDB,
  enrichContentWithTMDB
};

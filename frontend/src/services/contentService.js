/**
 * Content service — fetches real data from the backend API.
 * Normalizes backend field names to what the frontend components expect.
 */
import { contentAPI } from './api';

/**
 * Normalize a backend content item to match the frontend's expected shape.
 * Backend: spokenLanguage (string), platforms (array), type: 'MOVIE'|'TV_SERIES'
 * Frontend: languages (array), platform (array), type: 'movie'|'tv'
 */
function normalizeContent(item) {
  return {
    id: item._id,
    title: item.title,
    type: item.type === 'MOVIE' ? 'movie' : item.type === 'TV_SERIES' ? 'tv' : item.type === 'WEB_SERIES' ? 'web' : item.type === 'ANIME' ? 'anime' : item.type === 'DOCUMENTARY' ? 'documentary' : item.type,
    genres: item.genres || [],
    languages: item.spokenLanguage ? [item.spokenLanguage] : [],
    platform: item.platforms || [],
    releaseYear: item.releaseYear,
    rating: item.rating || 0,
    status: item.status,
    tags: item.tags || [],
    poster: item.poster || '',
    backdrop: item.backdrop || '',
    description: item.description || '',
    alternativeTitles: item.originalTitle ? [item.originalTitle] : [],
    episodeCount: item.episodeCount || 0,
    currentEpisode: item.currentEpisode || 0,
    popularity: item.popularity || 0,
    trending: item.trending || 0,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
  };
}

/**
 * Extract raw items array from a section API response.
 * Sections return: { success: true, data: [...items] }
 * Axios wraps that in: response.data = { success, data }
 */
function extractItems(response) {
  const raw = response.data?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeContent) : [];
}

// ─── Section endpoints ────────────────────────────────────────────

export async function fetchTrending() {
  const res = await contentAPI.getTrending();
  return extractItems(res);
}

export async function fetchPopular() {
  const res = await contentAPI.getPopular();
  return extractItems(res);
}

export async function fetchLatestUpdates() {
  const res = await contentAPI.getLatestUpdates();
  return extractItems(res);
}

export async function fetchUpcoming() {
  const res = await contentAPI.getUpcoming();
  return extractItems(res);
}

export async function fetchRecommended() {
  const res = await contentAPI.getRecommended();
  return extractItems(res);
}

export async function fetchWhereToWatch() {
  const res = await contentAPI.getWhereToWatch();
  return extractItems(res);
}

// ─── Search / Filter endpoint ──────────────────────────────────────

/**
 * Fetch filtered content from the server.
 *
 * @param {Object} filters
 * @param {string} [filters.search]       — search query
 * @param {string} [filters.category]     — 'all' | 'movie' | 'tv'
 * @param {string[]} [filters.genres]      — genre names
 * @param {string[]} [filters.languages]   — language names
 * @param {string} [filters.releaseYear]   — year string or 'Before 2020'
 * @param {string[]} [filters.statuses]    — status names
 * @param {string[]} [filters.platforms]   — platform names
 * @param {string} [filters.sort]          — sort key
 * @param {number} [filters.page]          — page number
 * @param {number} [filters.perPage]       — items per page
 * @returns {{ items: Array, pagination: Object }}
 */
export async function fetchFilteredContent(filters = {}) {
  const {
    search = '',
    category = 'all',
    genres = [],
    languages = [],
    releaseYear = null,
    statuses = [],
    platforms = [],
    sort = 'popular',
    page = 1,
    perPage = 20,
  } = filters;

  // Build query params for the backend API
  const params = {};

  if (search.trim()) params.search = search.trim();    if (category !== 'all') {
    const typeMap = {
      movie: 'MOVIE', tv: 'TV_SERIES', web: 'WEB_SERIES',
      anime: 'ANIME', documentary: 'DOCUMENTARY', sports: 'SPORTS'
    };
    params.type = typeMap[category] || 'MOVIE';
  }
  if (genres.length > 0) params.genres = genres.join(',');
  if (languages.length > 0) params.languages = languages.join(',');
  if (releaseYear) params.years = releaseYear;
  if (statuses.length > 0) params.statuses = statuses.join(',');
  if (platforms.length > 0) params.platforms = platforms.join(',');
  if (sort) params.sort = sort;
  params.page = page;
  params.limit = perPage;

  try {
    const res = await contentAPI.search(params);
    const body = res.data;
    // Backend returns: { success, data: [...items], meta: { page, limit, total, totalPages } }
    const raw = body?.data || [];
    const meta = body?.meta || { page: 1, limit: perPage, total: 0, totalPages: 1 };

    return {
      items: raw.map(normalizeContent),
      pagination: {
        page: meta.page || 1,
        perPage: meta.limit || perPage,
        total: meta.total || 0,
        totalPages: meta.totalPages || 1,
      },
    };
  } catch (err) {
    // Propagate error so SearchPage can display error state and retry
    throw err;
  }
}

// ─── Suggestions ──────────────────────────────────────────────────

export async function fetchSuggestions(query) {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await contentAPI.suggest(query.trim());
    const raw = res.data?.data || [];
    return raw
      .map((s) => ({
        id: s._id,
        title: s.title,
        type: s.type === 'MOVIE' ? 'movie' : s.type === 'TV_SERIES' ? 'tv' : s.type === 'WEB_SERIES' ? 'web' : s.type === 'ANIME' ? 'anime' : s.type === 'DOCUMENTARY' ? 'documentary' : 'movie',
      }))
      .slice(0, 5);
  } catch {
    return [];
  }
}

// ─── Single content ────────────────────────────────────────────────

export async function fetchContentById(id) {
  const res = await contentAPI.getById(id);
  return normalizeContent(res.data?.data);
}

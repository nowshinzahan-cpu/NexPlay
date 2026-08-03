const Content = require('../models/Content');
const { HTTP_STATUS } = require('../constants');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parseSearchQuery, parsePagination } = require('../utils/helpers');
const { getStreamingAvailability } = require('../services/tmdbService');

// Helper to build filter query
const buildFilterQuery = (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };
  const { search, type, genres, languages, years, statuses, platforms, sort = 'popular' } = query;

  // Collect conditions that must be ANDed together
  const andConditions = [];

  // Text search — escape regex to prevent ReDoS
  if (search) {
    const escaped = parseSearchQuery(search);
    andConditions.push({
      $or: [
        { title: escaped },
        { originalTitle: escaped },
        { tags: escaped },
        { genres: escaped }
      ]
    });
  }

  // Type filter
  if (type) {
    filter.type = type;
  }

  // Genre filter — AND logic: content must match ALL selected genres
  if (genres) {
    const genreList = genres.split(',').map(g => g.trim());
    filter.genres = { $all: genreList };
  }

  // Language filter — OR logic (single-value field)
  if (languages) {
    const langList = languages.split(',').map(l => l.trim());
    filter.spokenLanguage = { $in: langList };
  }

  // Year filter
  if (years) {
    const yearList = years.split(',').map(y => y.trim());
    const yearConditions = [];
    yearList.forEach(year => {
      if (year === 'Before 2020') {
        yearConditions.push({ releaseYear: { $lt: 2020 } });
      } else {
        const numYear = parseInt(year, 10);
        if (!isNaN(numYear)) {
          yearConditions.push({ releaseYear: numYear });
        }
      }
    });
    if (yearConditions.length > 0) {
      andConditions.push({ $or: yearConditions });
    }
  }

  // Status filter
  if (statuses) {
    const statusList = statuses.split(',').map(s => s.trim());
    filter.status = { $in: statusList };
  }

  // Platform filter — AND logic: content must be available on ALL selected platforms
  if (platforms) {
    const platformList = platforms.split(',').map(p => p.trim());
    filter.platforms = { $all: platformList };
  }

  // Combine all AND conditions into the filter
  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  return { filter, sort, page, limit, skip };
};

// Build sort object
const buildSort = (sort) => {
  switch (sort) {
    case 'popular': return { popularity: -1 };
    case 'trending': return { trending: -1 };
    case 'latest': return { updatedAt: -1 };
    case 'releaseDate': return { releaseYear: -1 };
    case 'rating': return { rating: -1 };
    case 'az': return { title: 1 };
    case 'newest': return { createdAt: -1 };
    case 'oldest': return { createdAt: 1 };
    default: return { popularity: -1 };
  }
};

// Search & Filter Content
exports.searchContent = async (req, res, next) => {
  try {
    const { filter, sort, page, limit, skip } = buildFilterQuery(req.query);
    const sortObj = buildSort(sort);

    const total = await Content.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const data = await Content.find(filter)
      .sort(sortObj)
      .skip((safePage - 1) * limit)
      .limit(limit)
      .lean();

    return sendPaginated(res, data, total, safePage, limit, 'Content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Trending Content
exports.getTrending = async (req, res, next) => {
  try {
    const data = await Content.find({ isActive: true, trending: { $gt: 0 } })
      .sort({ trending: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Trending content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Popular Content
exports.getPopular = async (req, res, next) => {
  try {
    const data = await Content.find({ isActive: true, popularity: { $gt: 0 } })
      .sort({ popularity: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Popular content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Recommended Content
exports.getRecommended = async (req, res, next) => {
  try {
    const data = await Content.find({ isActive: true, rating: { $gte: 7 } })
      .sort({ rating: -1, popularity: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Recommended content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Latest Updates
exports.getLatestUpdates = async (req, res, next) => {
  try {
    const data = await Content.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Latest updates fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Upcoming Content
exports.getUpcoming = async (req, res, next) => {
  try {
    const data = await Content.find({
      isActive: true,
      status: 'Upcoming'
    })
      .sort({ releaseYear: 1, createdAt: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Upcoming content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Where to Watch
exports.getWhereToWatch = async (req, res, next) => {
  try {
    const data = await Content.find({
      isActive: true,
      platforms: { $not: { $size: 0 } }
    })
      .sort({ popularity: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, data, 'Watch platforms fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Single Content by ID — only return active content
exports.getContentById = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!content) {
      return sendError(res, 'Content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    // FR-48: Enrich with TMDB streaming availability if TMDB ID is available
    let streamingProviders = [];
    if (content.tmdbId) {
      const type = content.type === 'MOVIE' ? 'movie' : 'tv';
      streamingProviders = await getStreamingAvailability(content.tmdbId, type);
    }

    return sendSuccess(res, {
      ...content,
      streamingProviders
    }, 'Content fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Search Suggestions — escape regex to prevent ReDoS
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return sendSuccess(res, [], 'Suggestions fetched successfully');
    }

    const escaped = parseSearchQuery(q);
    const suggestions = await Content.find({
      isActive: true,
      $or: [
        { title: escaped },
        { originalTitle: escaped },
        { tags: escaped }
      ]
    })
      .select('title type')
      .limit(8)
      .lean();

    return sendSuccess(res, suggestions, 'Suggestions fetched successfully');
  } catch (error) {
    next(error);
  }
};

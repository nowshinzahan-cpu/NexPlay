/**
 * Recommendation Controller — generates personalized content recommendations
 * based on user's watchlist history, preferred genres/languages, and ratings.
 */
const Content = require('../models/Content');
const Review = require('../models/Review');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/user/recommendations
 * Get personalized recommendations for the current user.
 * 
 * Strategy:
 * 1. Extract user's preferred genres and languages from their watchlist + reviews
 * 2. Find similar content that matches those preferences
 * 3. Exclude content already in watchlist
 * 4. Return top results sorted by popularity
 */
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Get user's watchlist content IDs
    const watchlistIds = user.watchlist || [];

    // Get user's reviewed content to extract preferences
    const userReviews = await Review.find({ userId }).populate('contentId', 'genres spokenLanguage').lean();

    // Extract preferred genres and languages
    const genreCounts = {};
    const languageCounts = {};

    // From reviews
    userReviews.forEach(review => {
      if (review.contentId) {
        (review.contentId.genres || []).forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        if (review.contentId.spokenLanguage) {
          languageCounts[review.contentId.spokenLanguage] = 
            (languageCounts[review.contentId.spokenLanguage] || 0) + 1;
        }
      }
    });

    // From watchlist (fetch content details)
    if (watchlistIds.length > 0) {
      const watchlistContent = await Content.find({ _id: { $in: watchlistIds } }).lean();
      watchlistContent.forEach(content => {
        (content.genres || []).forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 2; // Weight watchlist higher
        });
        if (content.spokenLanguage) {
          languageCounts[content.spokenLanguage] = 
            (languageCounts[content.spokenLanguage] || 0) + 2;
        }
      });
    }

    // Sort preferences by count (most preferred first)
    const preferredGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    const preferredLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    // Build recommendation query
    const filter = { isActive: true };

    // If user has preferences, use them. Otherwise return high-rated content.
    if (preferredGenres.length > 0) {
      filter.genres = { $in: preferredGenres };
    } else {
      filter.rating = { $gte: 7 };
    }

    // Exclude content already in watchlist
    if (watchlistIds.length > 0) {
      filter._id = { $nin: watchlistIds };
    }

    // Fetch content — we'll score and sort post-query for language/genre boosting
    const recommendations = await Content.find(filter)
      .sort({ popularity: -1 })
      .limit(50) // Fetch extra to allow language/score re-ranking
      .lean();

    // Sort recommendations by preference match score
    const scored = recommendations.map(content => {
      let score = 0;

      // Score based on genre overlap
      const genreOverlap = (content.genres || []).filter(g => preferredGenres.includes(g)).length;
      score += genreOverlap * 10;

      // Score based on language match
      if (preferredLanguages.includes(content.spokenLanguage)) {
        score += 15;
      }

      // Popularity bonus
      score += (content.popularity || 0) / 10;

      // Rating bonus
      score += (content.rating || 0) * 2;

      return { ...content, recommendationScore: score };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return sendSuccess(
      res,
      scored.slice(0, 20),
      'Personalized recommendations retrieved',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonalizedRecommendations
};

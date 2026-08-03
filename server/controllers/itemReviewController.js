const { ItemReview } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { awardPoints } = require('../services/gamificationService');

/**
 * POST /api/reviews
 * Create a new review
 */
const createReview = async (req, res, next) => {
  try {
    const { itemId, itemType, rating, body } = req.body;

    if (!itemId || !itemType || rating === undefined) {
      return sendError(
        res,
        'Item ID, item type, and rating are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
    }

    if (!['content', 'match', 'sport', 'platform', 'broadcaster'].includes(itemType)) {
      return sendError(res, 'Invalid item type', HTTP_STATUS.BAD_REQUEST, 'INVALID_ITEM_TYPE');
    }

    const review = await ItemReview.create({
      userId: req.user.id,
      itemId,
      itemType,
      rating,
      body: body || '',
      verified: false
    });

    // 🎮 Award points for creating a review
    awardPoints(req.user.id, 'review_created', review._id, 'ItemReview').catch(() => {});

    return sendSuccess(res, { review }, 'Review created', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        'You have already reviewed this item',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_REVIEW'
      );
    }
    next(error);
  }
};

/**
 * PUT /api/reviews/:id
 * Update own review
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await ItemReview.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (review.userId.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to update this review', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    const { rating, body } = req.body;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return sendError(res, 'Rating must be between 1 and 5', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
      }
      review.rating = rating;
    }
    if (body !== undefined) {
      review.body = body;
    }

    await review.save();

    return sendSuccess(res, { review }, 'Review updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete own review
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await ItemReview.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (review.userId.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this review', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    await ItemReview.findByIdAndDelete(req.params.id);

    return sendSuccess(res, {}, 'Review deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/items/:itemId/reviews
 * Get all reviews for an item with pagination and sorting
 */
const getItemReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { sort = 'recent' } = req.query;
    const { itemId } = req.params;

    let sortObj = { createdAt: -1 };
    if (sort === 'helpful') sortObj = { helpfulVotes: -1, createdAt: -1 };
    if (sort === 'rating') sortObj = { rating: -1, createdAt: -1 };
    if (sort === 'recent') sortObj = { createdAt: -1 };

    const filter = { itemId, isActive: true };

    const [reviews, total] = await Promise.all([
      ItemReview.find(filter)
        .populate('userId', 'fullName username avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      ItemReview.countDocuments(filter)
    ]);

    return sendPaginated(res, reviews, total, page, limit, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/items/:itemId/rating-summary
 * Get rating summary for an item
 */
const getRatingSummary = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { itemType = 'content' } = req.query;

    const summary = await ItemReview.getRatingSummary(itemId, itemType);

    return sendSuccess(res, summary, 'Rating summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews/:id/helpful
 * Mark a review as helpful
 */
const markHelpful = async (req, res, next) => {
  try {
    const review = await ItemReview.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    // Check if user already voted
    const userId = req.user.id;
    if (review.helpfulVoters.some(v => v.toString() === userId)) {
      return sendError(res, 'Already marked as helpful', HTTP_STATUS.CONFLICT, 'ALREADY_VOTED');
    }

    review.helpfulVotes += 1;
    review.helpfulVoters.push(userId);
    await review.save();

    // 🎮 Award points to review author for getting a helpful vote
    if (review.userId.toString() !== userId) {
      awardPoints(review.userId, 'review_liked', review._id, 'ItemReview').catch(() => {});
    }

    return sendSuccess(res, { helpfulVotes: review.helpfulVotes }, 'Marked as helpful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getItemReviews,
  getRatingSummary,
  markHelpful
};

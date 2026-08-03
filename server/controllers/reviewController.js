const { Review, Content } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * POST /api/content/:id/reviews
 * Submit a rating/review for a content item
 */
const createReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const { id: contentId } = req.params;

    if (!rating || rating < 1 || rating > 10) {
      return sendError(res, 'Rating must be between 1 and 10', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
    }

    // Check content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return sendError(res, 'Content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    // Check if user already reviewed this content
    const existing = await Review.findOne({ userId: req.user.id, contentId });
    if (existing) {
      return sendError(res, 'You have already reviewed this content. Use update instead.', HTTP_STATUS.CONFLICT, 'ALREADY_REVIEWED');
    }

    const newReview = await Review.create({
      userId: req.user.id,
      contentId,
      rating,
      review: review || ''
    });

    // Calculate and update average rating
    const avg = await Review.calculateAverageRating(contentId);
    content.rating = avg.averageRating;
    await content.save();

    return sendSuccess(
      res,
      { review: newReview, averageRating: avg.averageRating, totalReviews: avg.count },
      'Review submitted successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/content/:id/reviews
 * Update existing review
 */
const updateReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const { id: contentId } = req.params;

    const existing = await Review.findOne({ userId: req.user.id, contentId });
    if (!existing) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 10) {
        return sendError(res, 'Rating must be between 1 and 10', HTTP_STATUS.BAD_REQUEST, 'INVALID_RATING');
      }
      existing.rating = rating;
    }

    if (review !== undefined) {
      existing.review = review;
    }

    await existing.save();

    // Update average rating
    const avg = await Review.calculateAverageRating(contentId);
    await Content.findByIdAndUpdate(contentId, { rating: avg.averageRating });

    return sendSuccess(
      res,
      { review: existing, averageRating: avg.averageRating, totalReviews: avg.count },
      'Review updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/content/:id/reviews
 * Delete own review
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id: contentId } = req.params;

    const review = await Review.findOneAndDelete({ userId: req.user.id, contentId });
    if (!review) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    // Recalculate average rating
    const avg = await Review.calculateAverageRating(contentId);
    await Content.findByIdAndUpdate(contentId, { rating: avg.averageRating });

    return sendSuccess(res, {}, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/content/:id/reviews
 * Get all reviews for a content item
 */
const getContentReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { id: contentId } = req.params;

    const filter = { contentId, isActive: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    return sendPaginated(res, reviews, total, page, limit, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/reviews
 * Get current user's reviews
 */
const getMyReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user.id })
        .populate('contentId', 'title poster type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ userId: req.user.id })
    ]);

    return sendPaginated(res, reviews, total, page, limit, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reviews
 * Admin: get all reviews (for moderation)
 */
const adminGetReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = {};
    if (status === 'flagged') filter.isModerated = false;
    if (status === 'moderated') filter.isModerated = true;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'fullName username email')
        .populate('contentId', 'title type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    return sendPaginated(res, reviews, total, page, limit, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/reviews/:id/moderate
 * Admin: moderate a review (remove inappropriate content)
 */
const adminModerateReview = async (req, res, next) => {
  try {
    const { action } = req.body; // 'remove' or 'restore'

    const review = await Review.findById(req.params.id);
    if (!review) {
      return sendError(res, 'Review not found', HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (action === 'remove') {
      review.isActive = false;
      review.isModerated = true;
      review.moderatedBy = req.user.id;
    } else if (action === 'restore') {
      review.isActive = true;
      review.isModerated = false;
      review.moderatedBy = null;
    } else {
      return sendError(res, 'Invalid action (remove/restore)', HTTP_STATUS.BAD_REQUEST, 'INVALID_ACTION');
    }

    await review.save();

    // Recalculate average rating
    const avg = await Review.calculateAverageRating(review.contentId);
    await Content.findByIdAndUpdate(review.contentId, { rating: avg.averageRating });

    return sendSuccess(res, { review: review.toJSON() }, `Review ${action}d successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getContentReviews,
  getMyReviews,
  adminGetReviews,
  adminModerateReview
};

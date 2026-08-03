const { User, Content } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/user/watchlist
 * Get current user's watchlist
 */
const getWatchlist = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Get total count
    const total = user.watchlist.length;

    // Get paginated watchlist items with content details
    const watchlistIds = user.watchlist.slice(skip, skip + limit);
    const items = await Content.find({ _id: { $in: watchlistIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Maintain order based on when items were added
    const orderedItems = watchlistIds
      .map(id => items.find(item => item._id.toString() === id.toString()))
      .filter(Boolean);

    return sendPaginated(res, orderedItems, total, page, limit, 'Watchlist retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/user/watchlist/:contentId
 * Add content to user's watchlist
 */
const addToWatchlist = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    // Check content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return sendError(res, 'Content not found', HTTP_STATUS.NOT_FOUND, 'CONTENT_NOT_FOUND');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Check if already in watchlist — convert to string comparison
    const isAlreadyAdded = user.watchlist.some(id => id.toString() === contentId);
    if (isAlreadyAdded) {
      return sendError(res, 'Content already in watchlist', HTTP_STATUS.CONFLICT, 'ALREADY_IN_WATCHLIST');
    }

    user.watchlist.push(contentId);
    await user.save();

    return sendSuccess(res, { watchlist: user.watchlist }, 'Added to watchlist', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/user/watchlist/:contentId
 * Remove content from user's watchlist
 */
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Find index by string comparison
    const index = user.watchlist.findIndex(id => id.toString() === contentId);
    if (index === -1) {
      return sendError(res, 'Content not in watchlist', HTTP_STATUS.NOT_FOUND, 'NOT_IN_WATCHLIST');
    }

    user.watchlist.splice(index, 1);
    await user.save();

    return sendSuccess(res, { watchlist: user.watchlist }, 'Removed from watchlist');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/watchlist/check/:contentId
 * Check if content is in user's watchlist
 */
const checkWatchlist = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Convert to string comparison
    const isInWatchlist = user.watchlist.some(id => id.toString() === contentId);

    return sendSuccess(res, { isInWatchlist }, 'Watchlist status checked');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist
};

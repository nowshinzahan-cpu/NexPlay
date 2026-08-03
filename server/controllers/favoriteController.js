const { Favorite } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { awardPoints } = require('../services/gamificationService');

const addFavorite = async (req, res, next) => {
  try {
    const { type, refId, refName, sportType } = req.body;

    if (!type || !refId) {
      return sendError(res, 'Type and reference ID are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    const existing = await Favorite.findOne({
      userId: req.user.id,
      type,
      refId
    });

    if (existing) {
      return sendError(res, 'Already in favorites', HTTP_STATUS.CONFLICT, 'ALREADY_FAVORITED');
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      type,
      refId,
      refName: refName || '',
      sportType: sportType || null
    });

    // 🎮 Award points for adding a favorite
    awardPoints(req.user.id, 'favorite_added', favorite._id, 'Favorite').catch(() => {});

    return sendSuccess(res, { favorite }, 'Added to favorites', HTTP_STATUS.CREATED);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Already in favorites', HTTP_STATUS.CONFLICT, 'DUPLICATE_FAVORITE');
    }
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { type, refId } = req.body;

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.id,
      type,
      refId
    });

    if (!favorite) {
      return sendError(res, 'Favorite not found', HTTP_STATUS.NOT_FOUND, 'FAVORITE_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { type } = req.query;

    const filter = { userId: req.user.id };
    if (type) filter.type = type;

    const [favorites, total] = await Promise.all([
      Favorite.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Favorite.countDocuments(filter)
    ]);

    return sendPaginated(res, favorites, total, page, limit, 'Favorites retrieved');
  } catch (error) {
    next(error);
  }
};

const checkFavorite = async (req, res, next) => {
  try {
    const { type, refId } = req.query;

    const favorite = await Favorite.findOne({
      userId: req.user.id,
      type,
      refId
    }).lean();

    return sendSuccess(res, { isFavorited: !!favorite, favorite }, 'Favorite checked');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};

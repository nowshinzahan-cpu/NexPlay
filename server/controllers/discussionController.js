const { Discussion } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination, parseSearchQuery } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { awardPoints } = require('../services/gamificationService');

const getDiscussions = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, tag } = req.query;

    const filter = { isActive: true };

    if (search) {
      const escaped = parseSearchQuery(search);
      filter.$or = [
        { title: escaped },
        { body: escaped },
        { tags: escaped }
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    const [discussions, total] = await Promise.all([
      Discussion.find(filter)
        .populate('authorId', 'fullName username avatar')
        .sort({ pinned: -1, lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Discussion.countDocuments(filter)
    ]);

    return sendPaginated(res, discussions, total, page, limit, 'Discussions retrieved');
  } catch (error) {
    next(error);
  }
};

const getDiscussionById = async (req, res, next) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' }
    )
      .populate('authorId', 'fullName username avatar')
      .lean();

    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }

    return sendSuccess(res, discussion, 'Discussion retrieved');
  } catch (error) {
    next(error);
  }
};

const createDiscussion = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      return sendError(res, 'Title and body are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    const discussion = await Discussion.create({
      title,
      body,
      authorId: req.user.id,
      tags: tags || []
    });

    // 🎮 Award points for creating a discussion
    awardPoints(req.user.id, 'discussion_created', discussion._id, 'Discussion').catch(() => {});

    return sendSuccess(res, { discussion }, 'Discussion created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }

    if (discussion.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    if (discussion.locked && req.user.role !== 'admin') {
      return sendError(res, 'Discussion is locked', HTTP_STATUS.FORBIDDEN, 'DISCUSSION_LOCKED');
    }

    const { title, body, tags } = req.body;
    if (title !== undefined) discussion.title = title;
    if (body !== undefined) discussion.body = body;
    if (tags !== undefined) discussion.tags = tags;

    await discussion.save();

    return sendSuccess(res, { discussion }, 'Discussion updated');
  } catch (error) {
    next(error);
  }
};

const deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }

    if (discussion.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    discussion.isActive = false;
    await discussion.save();

    const { Comment } = require('../models');
    await Comment.updateMany(
      { discussionId: discussion._id },
      { $set: { isActive: false } }
    );

    return sendSuccess(res, {}, 'Discussion deleted');
  } catch (error) {
    next(error);
  }
};

const toggleLock = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }

    discussion.locked = !discussion.locked;
    await discussion.save();

    return sendSuccess(res, { locked: discussion.locked }, `Discussion ${discussion.locked ? 'locked' : 'unlocked'}`);
  } catch (error) {
    next(error);
  }
};

const togglePin = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }

    discussion.pinned = !discussion.pinned;
    await discussion.save();

    return sendSuccess(res, { pinned: discussion.pinned }, `Discussion ${discussion.pinned ? 'pinned' : 'unpinned'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLock,
  togglePin
};

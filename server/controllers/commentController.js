const { Comment, Discussion } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');
const { awardPoints } = require('../services/gamificationService');

/**
 * GET /api/discussions/:discussionId/comments
 */
const getComments = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { discussionId } = req.params;

    const filter = { discussionId, isActive: true, parentCommentId: null };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('authorId', 'fullName username avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter)
    ]);

    const commentIds = comments.map(c => c._id);
    const replies = await Comment.find({
      discussionId,
      parentCommentId: { $in: commentIds },
      isActive: true
    })
      .populate('authorId', 'fullName username avatar')
      .sort({ createdAt: 1 })
      .lean();

    const repliesByParent = {};
    replies.forEach(reply => {
      const parentKey = reply.parentCommentId.toString();
      if (!repliesByParent[parentKey]) repliesByParent[parentKey] = [];
      repliesByParent[parentKey].push(reply);
    });

    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: repliesByParent[comment._id.toString()] || []
    }));

    return sendPaginated(res, commentsWithReplies, total, page, limit, 'Comments retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/discussions/:discussionId/comments
 */
const createComment = async (req, res, next) => {
  try {
    const { body, parentCommentId } = req.body;
    const { discussionId } = req.params;

    if (!body) {
      return sendError(res, 'Comment body is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_BODY');
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return sendError(res, 'Discussion not found', HTTP_STATUS.NOT_FOUND, 'DISCUSSION_NOT_FOUND');
    }
    if (discussion.locked) {
      return sendError(res, 'Discussion is locked. No new comments allowed.', HTTP_STATUS.FORBIDDEN, 'DISCUSSION_LOCKED');
    }

    let depth = 0;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return sendError(res, 'Parent comment not found', HTTP_STATUS.NOT_FOUND, 'PARENT_NOT_FOUND');
      }
      depth = parentComment.depth + 1;
      if (depth > 3) {
        return sendError(res, 'Maximum reply depth (3 levels) reached', HTTP_STATUS.BAD_REQUEST, 'MAX_DEPTH');
      }
    }

    const comment = await Comment.create({
      discussionId,
      authorId: req.user.id,
      body,
      parentCommentId: parentCommentId || null,
      depth
    });

    discussion.commentCount += 1;
    discussion.lastActivityAt = new Date();
    await discussion.save();

    // 🎮 Award points for creating a comment
    awardPoints(req.user.id, 'comment_created', comment._id, 'Comment').catch(() => {});

    return sendSuccess(res, { comment }, 'Comment created', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/comments/:id
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendError(res, 'Comment not found', HTTP_STATUS.NOT_FOUND, 'COMMENT_NOT_FOUND');
    }
    if (comment.authorId.toString() !== req.user.id) {
      return sendError(res, 'Not authorized', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    const { body } = req.body;
    if (body === undefined || !body.trim()) {
      return sendError(res, 'Comment body is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_BODY');
    }

    comment.body = body;
    await comment.save();
    return sendSuccess(res, { comment }, 'Comment updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendError(res, 'Comment not found', HTTP_STATUS.NOT_FOUND, 'COMMENT_NOT_FOUND');
    }
    if (comment.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', HTTP_STATUS.FORBIDDEN, 'NOT_OWNER');
    }

    comment.isActive = false;
    await comment.save();

    await Discussion.findByIdAndUpdate(comment.discussionId, { $inc: { commentCount: -1 } });

    return sendSuccess(res, {}, 'Comment deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/comments/:id/like
 */
const toggleLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendError(res, 'Comment not found', HTTP_STATUS.NOT_FOUND, 'COMMENT_NOT_FOUND');
    }

    const userId = req.user.id;
    const index = comment.likes.findIndex(id => id.toString() === userId);

    if (index > -1) {
      comment.likes.splice(index, 1);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      await comment.save();
      return sendSuccess(res, { liked: false, likeCount: comment.likeCount }, 'Comment unliked');
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
      await comment.save();

      // 🎮 Award points to comment author for getting a like
      if (comment.authorId.toString() !== userId) {
        awardPoints(comment.authorId, 'comment_liked', comment._id, 'Comment').catch(() => {});
      }

      return sendSuccess(res, { liked: true, likeCount: comment.likeCount }, 'Comment liked');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLike
};

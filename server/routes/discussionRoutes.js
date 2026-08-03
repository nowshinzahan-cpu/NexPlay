const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const discussionController = require('../controllers/discussionController');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

// Public routes
router.get('/', discussionController.getDiscussions);
router.get('/:id', discussionController.getDiscussionById);
router.get('/:discussionId/comments', commentController.getComments);

// Authenticated: create discussion
router.post('/', authMiddleware, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('body').trim().notEmpty().withMessage('Body is required').isLength({ max: 10000 }).withMessage('Body cannot exceed 10000 characters'),
  validateMiddleware
], discussionController.createDiscussion);

// Authenticated: update discussion
router.put('/:id', authMiddleware, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('body').optional().trim().isLength({ max: 10000 }).withMessage('Body cannot exceed 10000 characters'),
  validateMiddleware
], discussionController.updateDiscussion);

// Authenticated: delete discussion
router.delete('/:id', authMiddleware, discussionController.deleteDiscussion);

// Authenticated: create comment
router.post('/:discussionId/comments', authMiddleware, [
  body('body').trim().notEmpty().withMessage('Comment body is required').isLength({ max: 5000 }).withMessage('Comment cannot exceed 5000 characters'),
  validateMiddleware
], commentController.createComment);

module.exports = router;

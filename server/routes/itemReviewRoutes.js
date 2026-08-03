const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itemReviewController = require('../controllers/itemReviewController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

// Public routes
router.get('/items/:itemId/reviews', itemReviewController.getItemReviews);
router.get('/items/:itemId/rating-summary', itemReviewController.getRatingSummary);

// Authenticated: create review
router.post('/reviews', authMiddleware, [
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('itemType').isIn(['content', 'match', 'sport', 'platform', 'broadcaster']).withMessage('Invalid item type'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('body').optional().trim().isLength({ max: 2000 }).withMessage('Review cannot exceed 2000 characters'),
  validateMiddleware
], itemReviewController.createReview);

// Authenticated: update review
router.put('/reviews/:id', authMiddleware, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('body').optional().trim().isLength({ max: 2000 }).withMessage('Review cannot exceed 2000 characters'),
  validateMiddleware
], itemReviewController.updateReview);

// Authenticated: delete review
router.delete('/reviews/:id', authMiddleware, itemReviewController.deleteReview);

// Authenticated: mark helpful
router.post('/reviews/:id/helpful', authMiddleware, itemReviewController.markHelpful);

module.exports = router;

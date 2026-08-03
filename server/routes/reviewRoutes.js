const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');

// Public: get reviews for a content item
router.get('/:id/reviews', reviewController.getContentReviews);

// User: create/update/delete own reviews (authenticated)
router.post(
  '/:id/reviews',
  authMiddleware,
  roleMiddleware(ROLES.USER),
  [
    body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
    validateMiddleware
  ],
  reviewController.createReview
);

router.put(
  '/:id/reviews',
  authMiddleware,
  roleMiddleware(ROLES.USER),
  reviewController.updateReview
);

router.delete(
  '/:id/reviews',
  authMiddleware,
  roleMiddleware(ROLES.USER),
  reviewController.deleteReview
);

module.exports = router;

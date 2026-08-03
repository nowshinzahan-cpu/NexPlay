const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const watchlistController = require('../controllers/watchlistController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');
const recommendationController = require('../controllers/recommendationController');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.USER));

// Profile routes
router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  [
    body('fullName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be 2-50 characters'),
    validateMiddleware
  ],
  userController.updateProfile
);
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('confirmPassword').exists().withMessage('Confirm password is required'),
    validateMiddleware
  ],
  userController.changePassword
);

// Watchlist routes
router.get('/watchlist', watchlistController.getWatchlist);
router.get('/watchlist/check/:contentId', watchlistController.checkWatchlist);
router.post('/watchlist/:contentId', watchlistController.addToWatchlist);
router.delete('/watchlist/:contentId', watchlistController.removeFromWatchlist);

// My reviews
router.get('/reviews', reviewController.getMyReviews);

// Personalized recommendations
router.get('/recommendations', recommendationController.getPersonalizedRecommendations);

module.exports = router;

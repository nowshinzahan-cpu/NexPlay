const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Public routes - no auth required
router.get('/search', contentController.searchContent);
router.get('/trending', contentController.getTrending);
router.get('/popular', contentController.getPopular);
router.get('/recommended', contentController.getRecommended);
router.get('/latest-updates', contentController.getLatestUpdates);
router.get('/upcoming', contentController.getUpcoming);
router.get('/where-to-watch', contentController.getWhereToWatch);
router.get('/suggestions', contentController.getSuggestions);
router.get('/:id', contentController.getContentById);

module.exports = router;

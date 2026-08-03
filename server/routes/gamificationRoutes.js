const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/badges', gamificationController.getAllBadges);

// Authenticated routes
router.get('/user/stats', authMiddleware, gamificationController.getUserStats);
router.get('/user/points-history', authMiddleware, gamificationController.getPointsHistory);

module.exports = router;

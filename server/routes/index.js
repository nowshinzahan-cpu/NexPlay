const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const passwordRoutes = require('./passwordRoutes');
const { router: companyRouter, publicRouter } = require('./companyRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const advertisementRoutes = require('./advertisementRoutes');
const campaignRoutes = require('./campaignRoutes');
const userRoutes = require('./userRoutes');
const contentRoutes = require('./contentRoutes');
const reviewRoutes = require('./reviewRoutes');
const sportRoutes = require('./sportRoutes');
const platformRoutes = require('./platformRoutes');
const upcomingContentRoutes = require('./upcomingContentRoutes');

// NEW Sprint 3 & 4 routes
const matchRoutes = require('./matchRoutes');
const broadcasterRoutes = require('./broadcasterRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const notificationPreferenceRoutes = require('./notificationPreferenceRoutes');
const itemReviewRoutes = require('./itemReviewRoutes');
const discussionRoutes = require('./discussionRoutes');
const commentRoutes = require('./commentRoutes');
const reportRoutes = require('./reportRoutes');
const moderationRoutes = require('./moderationRoutes');
const gamificationRoutes = require('./gamificationRoutes');

// Mount routes
router.use('/api/auth', authRoutes);
router.use('/api/auth', passwordRoutes);

// Public company profile (no auth) — must be before authenticated companyRouter
router.use('/api/company', publicRouter);

router.use('/api/company', companyRouter);
router.use('/api/company/advertisements', advertisementRoutes);
router.use('/api/company/campaigns', campaignRoutes);
router.use('/api/user', userRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/content', contentRoutes);
router.use('/api/content', reviewRoutes);
router.use('/api/sports', sportRoutes);
router.use('/api/platforms', platformRoutes);
router.use('/api/company/upcoming', upcomingContentRoutes);

// NEW Sprint 3 routes
router.use('/api', matchRoutes);              // /api/matches/*, /api/standings/*
router.use('/api/admin/broadcasters', broadcasterRoutes);  // /api/admin/broadcasters/*
router.use('/api/favorites', favoriteRoutes);  // /api/favorites/*
router.use('/api/notification-preferences', notificationPreferenceRoutes); // /api/notification-preferences/*
router.use('/api', itemReviewRoutes);          // /api/reviews/*, /api/items/*/reviews

// NEW Sprint 4 routes
router.use('/api/discussions', discussionRoutes);  // /api/discussions/*
router.use('/api/comments', commentRoutes);         // /api/comments/*
router.use('/api/reports', reportRoutes);           // /api/reports
router.use('/api/moderation', moderationRoutes);    // /api/moderation/*
router.use('/api', gamificationRoutes);             // /api/leaderboard, /api/user/stats

// Public advertisement endpoint (FR-16 - display active ads on LandingPage/SearchPage)
const advertisementController = require('../controllers/advertisementController');
router.get('/api/advertisements/active', advertisementController.getActiveAdvertisements);

// Health check
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NexPlay API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

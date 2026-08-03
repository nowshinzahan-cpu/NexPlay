const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const advertisementController = require('../controllers/advertisementController');
const campaignController = require('../controllers/campaignController');
const platformController = require('../controllers/platformController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Companies
router.get('/companies', adminController.getCompanies);
router.get('/companies/pending', adminController.getPendingCompanies);
router.get('/companies/:id', adminController.getCompanyById);
router.patch('/companies/:id/verify', adminController.verifyCompany);
router.delete('/companies/:id', adminController.deleteCompany);
router.patch('/companies/:id/status', adminController.toggleCompanyStatus);

// Advertisements
router.get('/advertisements', advertisementController.adminGetAdvertisements);
router.patch('/advertisements/:id/status', advertisementController.adminUpdateAdStatus);

// Campaigns
router.get('/campaigns', campaignController.adminGetCampaigns);
router.patch('/campaigns/:id/status', campaignController.adminUpdateCampaignStatus);

// Streaming Platforms
router.get('/platforms', platformController.getPlatforms);
router.post('/platforms', platformController.createPlatform);
router.put('/platforms/:id', platformController.updatePlatform);
router.delete('/platforms/:id', platformController.deletePlatform);

// Reviews (moderation)
router.get('/reviews', reviewController.adminGetReviews);
router.patch('/reviews/:id/moderate', reviewController.adminModerateReview);

// Featured Content
router.get('/contents/featured', adminController.getFeaturedContent);
router.patch('/contents/:id/featured', adminController.toggleFeaturedContent);

// Broadcast Notification
router.post('/notifications/broadcast', adminController.broadcastNotification);

// Activity Log
router.get('/activity-log', adminController.getActivityLog);

module.exports = router;

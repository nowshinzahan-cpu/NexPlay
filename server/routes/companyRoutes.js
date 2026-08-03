const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../utils/upload');
const { ROLES } = require('../constants');

// All company routes require authentication and company role
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.COMPANY));

// GET /api/company/profile - Get my profile
router.get('/profile', companyController.getMyProfile);

// PUT /api/company/profile - Update profile
router.put('/profile', companyController.updateProfile);

// POST /api/company/logo - Upload logo
router.post('/logo', upload.single('logo'), companyController.uploadLogo);

// Public profile (no auth required)
const publicRouter = express.Router();
publicRouter.get('/profile/:id', companyController.getPublicProfile);

module.exports = { router, publicRouter };

const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// Public: get active platforms
router.get('/', platformController.getActivePlatforms);

// Admin routes
router.get('/all', authMiddleware, roleMiddleware(ROLES.ADMIN), platformController.getPlatforms);
router.post('/', authMiddleware, roleMiddleware(ROLES.ADMIN), platformController.createPlatform);
router.put('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), platformController.updatePlatform);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), platformController.deletePlatform);

module.exports = router;

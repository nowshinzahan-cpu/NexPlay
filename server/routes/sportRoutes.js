const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// Public routes
router.get('/', sportController.getSports);
router.get('/live', sportController.getLiveSports);
router.get('/upcoming', sportController.getUpcomingSports);
router.get('/completed', sportController.getCompletedSports);
router.get('/types', sportController.getSportTypes);
router.get('/:id', sportController.getSportById);

// Admin routes
router.post('/', authMiddleware, roleMiddleware(ROLES.ADMIN), sportController.createSport);
router.put('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), sportController.updateSport);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), sportController.deleteSport);

module.exports = router;

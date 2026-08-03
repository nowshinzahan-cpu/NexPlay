const express = require('express');
const router = express.Router();
const upcomingContentController = require('../controllers/upcomingContentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// All routes require authentication and company role
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.COMPANY));

router.get('/', upcomingContentController.getMyUpcomingContent);
router.get('/all', upcomingContentController.getMyAllContent);
router.post('/', upcomingContentController.createUpcomingContent);
router.put('/:id', upcomingContentController.updateUpcomingContent);
router.delete('/:id', upcomingContentController.deleteUpcomingContent);

module.exports = router;

const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const discussionController = require('../controllers/discussionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get('/reports', moderationController.getReports);
router.patch('/reports/:id', moderationController.resolveReport);
router.get('/stats', moderationController.getModerationStats);

router.patch('/discussions/:id/lock', discussionController.toggleLock);
router.patch('/discussions/:id/pin', discussionController.togglePin);

module.exports = router;

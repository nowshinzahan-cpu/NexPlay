const express = require('express');
const router = express.Router();
const notificationPreferenceController = require('../controllers/notificationPreferenceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationPreferenceController.getPreferences);
router.put('/', notificationPreferenceController.updatePreferences);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const advertisementController = require('../controllers/advertisementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');

// Company routes
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.COMPANY));

router.get('/', advertisementController.getMyAdvertisements);
router.get('/:id', advertisementController.getMyAdvertisement);
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('placement').optional().isIn(['banner', 'sidebar', 'popup', 'featured']).withMessage('Invalid placement'),
    validateMiddleware
  ],
  advertisementController.createAdvertisement
);
router.put('/:id', advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);

module.exports = router;

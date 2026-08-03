const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');

// Company routes
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.COMPANY));

router.get('/', campaignController.getMyCampaigns);
router.get('/:id', campaignController.getMyCampaign);
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Campaign name must be 3-100 characters'),
    validateMiddleware
  ],
  campaignController.createCampaign
);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;

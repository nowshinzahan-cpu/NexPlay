const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const broadcasterController = require('../controllers/broadcasterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get('/', broadcasterController.getAllBroadcasters);
router.get('/:id', broadcasterController.getBroadcasterById);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Broadcaster name is required'),
  validateMiddleware
], broadcasterController.createBroadcaster);

router.put('/:id', broadcasterController.updateBroadcaster);
router.delete('/:id', broadcasterController.deleteBroadcaster);

router.post('/streams', [
  body('matchId').notEmpty().withMessage('Match ID is required'),
  body('broadcasterId').notEmpty().withMessage('Broadcaster ID is required'),
  body('region').trim().notEmpty().withMessage('Region is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  validateMiddleware
], broadcasterController.createStream);

router.delete('/streams/:id', broadcasterController.deleteStream);

module.exports = router;

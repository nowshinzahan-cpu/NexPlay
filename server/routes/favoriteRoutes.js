const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.get('/check', favoriteController.checkFavorite);

router.post('/', [
  body('type').isIn(['team', 'tournament', 'match', 'content']).withMessage('Invalid favorite type'),
  body('refId').notEmpty().withMessage('Reference ID is required'),
  validateMiddleware
], favoriteController.addFavorite);

router.delete('/', [
  body('type').notEmpty().withMessage('Type is required'),
  body('refId').notEmpty().withMessage('Reference ID is required'),
  validateMiddleware
], favoriteController.removeFavorite);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

router.post('/', authMiddleware, [
  body('targetType').isIn(['discussion', 'comment', 'review', 'user']).withMessage('Invalid target type'),
  body('targetId').notEmpty().withMessage('Target ID is required'),
  body('reason').isIn(['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other']).withMessage('Invalid reason'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  validateMiddleware
], reportController.createReport);

module.exports = router;

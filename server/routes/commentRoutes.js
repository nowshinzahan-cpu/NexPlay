const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

router.use(authMiddleware);

router.put('/:id', [
  body('body').trim().notEmpty().withMessage('Comment body is required').isLength({ max: 5000 }).withMessage('Comment cannot exceed 5000 characters'),
  validateMiddleware
], commentController.updateComment);

router.delete('/:id', commentController.deleteComment);
router.post('/:id/like', commentController.toggleLike);

module.exports = router;

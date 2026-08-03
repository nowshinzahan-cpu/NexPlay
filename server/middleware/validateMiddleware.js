const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return sendError(
      res,
      messages.join('. '),
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }
  next();
};

module.exports = validateMiddleware;

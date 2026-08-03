const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

const errorMiddleware = (err, req, res, next) => {
  // Log error without request body to avoid leaking passwords/tokens
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`, {
    stack: err.stack
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(
      res,
      messages.join(', '),
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(
      res,
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
      HTTP_STATUS.CONFLICT,
      'DUPLICATE_KEY'
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      'Invalid ID format.',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_ID'
    );
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(
      res,
      'File too large. Maximum size is 5MB.',
      HTTP_STATUS.BAD_REQUEST,
      'FILE_TOO_LARGE'
    );
  }

  // Multer file type error
  if (err.message && err.message.includes('Only image files')) {
    return sendError(
      res,
      err.message,
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_FILE_TYPE'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(
      res,
      'Invalid token.',
      HTTP_STATUS.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(
      res,
      'Token has expired.',
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_EXPIRED'
    );
  }

  // Default server error
  const statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.code || 'SERVER_ERROR' : undefined
  );
};

module.exports = errorMiddleware;

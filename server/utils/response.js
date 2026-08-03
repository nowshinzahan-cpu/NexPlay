const { HTTP_STATUS } = require('../constants');

// === New-style response functions (for contentController) ===

const successResponse = (res, message, data = null, statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message
  };

  if (data && data.data !== undefined && data.pagination !== undefined) {
    response.data = data.data;
    response.pagination = data.pagination;
  } else if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = HTTP_STATUS.BAD_REQUEST, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

// === Legacy response functions (used by other controllers & tests) ===

const sendSuccess = (res, data = {}, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = HTTP_STATUS.SERVER_ERROR, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (
  res,
  data = [],
  total = 0,
  page = 1,
  limit = 10,
  message = 'Success',
  extraMeta = {}
) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      ...extraMeta
    }
  });
};

module.exports = {
  // New-style
  successResponse,
  errorResponse,
  // Legacy
  sendSuccess,
  sendError,
  sendPaginated
};

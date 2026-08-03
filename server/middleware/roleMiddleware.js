const { sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required.',
        HTTP_STATUS.UNAUTHORIZED,
        'AUTH_REQUIRED'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'Forbidden. You do not have permission to perform this action.',
        HTTP_STATUS.FORBIDDEN,
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = roleMiddleware;

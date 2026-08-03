const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Company } = require('../models');
const { sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        'Access denied. No token provided.',
        HTTP_STATUS.UNAUTHORIZED,
        'NO_TOKEN'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(
        res,
        'Access denied. Invalid token format.',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_TOKEN_FORMAT'
      );
    }

    const decoded = jwt.verify(token, config.jwtAccessSecret);

    let user;
    if (decoded.type === 'company') {
      user = await Company.findById(decoded.userId).select('-password');
    } else {
      user = await User.findById(decoded.userId).select('-password');
    }

    if (!user) {
      return sendError(
        res,
        'User not found. Token may be invalid.',
        HTTP_STATUS.UNAUTHORIZED,
        'USER_NOT_FOUND'
      );
    }

    if (!user.isActive) {
      return sendError(
        res,
        'Account is deactivated. Contact support.',
        HTTP_STATUS.FORBIDDEN,
        'ACCOUNT_DEACTIVATED'
      );
    }

    req.user = {
      id: user._id.toString(),
      role: user.role || decoded.role,
      type: decoded.type || user.role,
      email: user.email,
      name: user.fullName || user.companyName
    };

    if (user.verificationStatus) {
      req.user.verificationStatus = user.verificationStatus;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(
        res,
        'Token has expired.',
        HTTP_STATUS.UNAUTHORIZED,
        'TOKEN_EXPIRED'
      );
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(
        res,
        'Invalid token.',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_TOKEN'
      );
    }
    return sendError(
      res,
      'Authentication failed.',
      HTTP_STATUS.UNAUTHORIZED,
      'AUTH_FAILED'
    );
  }
};

module.exports = authMiddleware;

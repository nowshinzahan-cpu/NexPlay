const { User, Company, Notification } = require('../models');

/**
 * Find a user or company by email across both collections
 */
const findAccountByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });
  let type = 'User';
  if (!user) {
    user = await Company.findOne({ email: normalizedEmail });
    type = 'Company';
  }
  return { user, type };
};

/**
 * Find a user or company by email or username across both collections
 */
const findAccountByLogin = async (emailOrUsername) => {
  const query = emailOrUsername.toLowerCase();
  let user = await User.findOne({
    $or: [{ email: query }, { username: query }]
  }).select('+password');
  let accountType = 'user';

  if (!user) {
    user = await Company.findOne({
      $or: [{ email: query }, { username: query }]
    }).select('+password');
    accountType = 'company';
  }

  return { user, accountType };
};

/**
 * Check if email is already taken across User and Company collections
 */
const isEmailTaken = async (email) => {
  const normalizedEmail = email.toLowerCase();
  const [user, company] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    Company.findOne({ email: normalizedEmail })
  ]);
  return !!(user || company);
};

/**
 * Check if username is already taken across User and Company collections
 */
const isUsernameTaken = async (username) => {
  const normalizedUsername = username.toLowerCase();
  const [user, company] = await Promise.all([
    User.findOne({ username: normalizedUsername }),
    Company.findOne({ username: normalizedUsername })
  ]);
  return !!(user || company);
};

/**
 * Create a notification for a recipient
 */
const createNotification = async ({ recipientId, recipientType, type, title, message, link = '' }) => {
  return Notification.create({
    recipientId,
    recipientType,
    type,
    title,
    message,
    link
  });
};

/**
 * Build MongoDB query filter from request query params
 */
const buildQueryFilter = (query, allowedFields = []) => {
  const filter = {};
  for (const field of allowedFields) {
    if (query[field] !== undefined && query[field] !== '') {
      if (typeof query[field] === 'string') {
        const escaped = query[field].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter[field] = { $regex: escaped, $options: 'i' };
      } else {
        filter[field] = query[field];
      }
    }
  }
  return filter;
};

/**
 * Strip invisible/non-printable Unicode characters from user input.
 * These characters (zero-width spaces, BOM, control chars, etc.) can be 
 * injected by browsers/extensions and cause query mismatches.
 */
const sanitizeInput = (str) => {
  if (!str) return str;
  // Strip: ZWS, ZWNJ, ZWJ, BOM, word joiners, soft hyphen, NBSP, 
  // bidi marks, line/paragraph separators, and other format chars
  return str
    .replace(/[\u200B-\u200F\u2028-\u202E\uFEFF\u2060-\u2064\u00AD\u00A0\u180E]/g, '')
    .trim();
};

module.exports = {
  findAccountByEmail,
  findAccountByLogin,
  isEmailTaken,
  isUsernameTaken,
  createNotification,
  buildQueryFilter,
  sanitizeInput
};

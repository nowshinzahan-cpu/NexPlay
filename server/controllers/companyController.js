const { Company } = require('../models');
const upload = require('../utils/upload');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/company/profile
 * Get the current company's profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.id);

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    return sendSuccess(res, { company: company.toPublicProfile() }, 'Company profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company/profile
 * Create/update company profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'companyName',
      'description',
      'industry',
      'website',
      'foundedYear',
      'location',
      'socialMediaLinks'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const company = await Company.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    return sendSuccess(res, { company: company.toPublicProfile() }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company/logo
 * Upload company logo
 */
const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST, 'NO_FILE');
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    const company = await Company.findByIdAndUpdate(
      req.user.id,
      { logo: logoUrl },
      { returnDocument: 'after' }
    );

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    return sendSuccess(res, { logo: logoUrl }, 'Logo uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/profile/:id
 * Get a company's public profile by ID
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return sendError(res, 'Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND');
    }

    return sendSuccess(res, { company: company.toPublicProfile() }, 'Company profile retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadLogo,
  getPublicProfile
};

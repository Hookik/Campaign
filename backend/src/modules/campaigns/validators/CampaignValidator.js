/**
 * Campaign Validators
 * Express middleware for request validation
 */

const { ApiError } = require('../../../utils/ApiError');

function validateCreateCampaign(req, res, next) {
  const { title, campaign_type } = req.body;

  if (!title || title.trim().length < 3) {
    return next(ApiError.badRequest('Title is required (minimum 3 characters)'));
  }

  const validTypes = ['fixed_fee', 'fee_plus_commission', 'gifted', 'invite_only', 'open'];
  if (!campaign_type || !validTypes.includes(campaign_type)) {
    return next(ApiError.badRequest(`campaign_type must be one of: ${validTypes.join(', ')}`));
  }

  if (campaign_type === 'fixed_fee' && !req.body.fee_per_creator && !req.body.total_budget) {
    return next(ApiError.badRequest('Fixed fee campaigns require fee_per_creator or total_budget'));
  }

  next();
}

function validateApplication(req, res, next) {
  const { pitch } = req.body;

  if (!pitch || pitch.trim().length < 10) {
    return next(ApiError.badRequest('Pitch is required (minimum 10 characters)'));
  }

  next();
}

function validateStatusTransition(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return next(ApiError.badRequest('Status is required'));
  }

  const validStatuses = [
    'draft', 'published', 'accepting', 'reviewing',
    'in_progress', 'completed', 'cancelled', 'expired', 'archived',
  ];

  if (!validStatuses.includes(status)) {
    return next(ApiError.badRequest(`Invalid status: ${status}`));
  }

  next();
}

function validateApplicationStatus(req, res, next) {
  const { status } = req.body;
  const valid = ['shortlisted', 'accepted', 'rejected'];

  if (!status || !valid.includes(status)) {
    return next(ApiError.badRequest(`Status must be one of: ${valid.join(', ')}`));
  }

  next();
}

function validateSubmissionReview(req, res, next) {
  const { action } = req.body;
  const valid = ['approve', 'request_revision', 'reject'];

  if (!action || !valid.includes(action)) {
    return next(ApiError.badRequest(`Action must be one of: ${valid.join(', ')}`));
  }

  next();
}

module.exports = {
  validateCreateCampaign,
  validateApplication,
  validateStatusTransition,
  validateApplicationStatus,
  validateSubmissionReview,
};

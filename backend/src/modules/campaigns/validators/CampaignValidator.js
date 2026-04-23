/**
 * Campaign Validators
 * Express middleware for request validation
 */

const { ApiError } = require('../../../utils/ApiError');

function validateCreateCampaign(req, res, next) {
  const { title, campaign_type, fee_per_creator, fee_min, fee_max, total_budget,
          max_creators, commission_rate, application_deadline } = req.body;

  // Title
  if (!title || title.trim().length < 3) {
    return next(ApiError.badRequest('Title is required (minimum 3 characters)'));
  }
  if (title.trim().length > 200) {
    return next(ApiError.badRequest('Title must be under 200 characters'));
  }

  // Campaign type
  const validTypes = ['fixed_fee', 'fee_plus_commission', 'gifted', 'invite_only', 'open'];
  if (!campaign_type || !validTypes.includes(campaign_type)) {
    return next(ApiError.badRequest(`campaign_type must be one of: ${validTypes.join(', ')}`));
  }

  if (campaign_type === 'fixed_fee' && !fee_per_creator && !total_budget) {
    return next(ApiError.badRequest('Fixed fee campaigns require fee_per_creator or total_budget'));
  }

  // Numeric validations
  if (fee_per_creator != null && (isNaN(fee_per_creator) || Number(fee_per_creator) < 0)) {
    return next(ApiError.badRequest('fee_per_creator must be a positive number'));
  }
  if (fee_min != null && (isNaN(fee_min) || Number(fee_min) < 0)) {
    return next(ApiError.badRequest('fee_min must be a positive number'));
  }
  if (fee_max != null && (isNaN(fee_max) || Number(fee_max) < 0)) {
    return next(ApiError.badRequest('fee_max must be a positive number'));
  }
  if (fee_min != null && fee_max != null && Number(fee_min) > Number(fee_max)) {
    return next(ApiError.badRequest('fee_min cannot exceed fee_max'));
  }
  if (total_budget != null && (isNaN(total_budget) || Number(total_budget) <= 0)) {
    return next(ApiError.badRequest('total_budget must be a positive number'));
  }
  if (max_creators != null && (isNaN(max_creators) || Number(max_creators) < 1 || Number(max_creators) > 10000)) {
    return next(ApiError.badRequest('max_creators must be between 1 and 10,000'));
  }
  if (commission_rate != null && (isNaN(commission_rate) || Number(commission_rate) < 0 || Number(commission_rate) > 100)) {
    return next(ApiError.badRequest('commission_rate must be between 0 and 100'));
  }

  // Deadline validation — skip if null, undefined, or empty string
  if (application_deadline && application_deadline !== '' && application_deadline !== null) {
    const deadline = new Date(application_deadline);
    if (isNaN(deadline.getTime())) {
      return next(ApiError.badRequest('application_deadline must be a valid date'));
    }
    // Only enforce future check for new campaigns (not updates)
    if (deadline.getTime() < Date.now() && !req.params?.id) {
      return next(ApiError.badRequest('application_deadline must be in the future'));
    }
  }

  // Description length
  if (req.body.description && req.body.description.length > 10000) {
    return next(ApiError.badRequest('Description must be under 10,000 characters'));
  }

  next();
}

function validateApplication(req, res, next) {
  const { pitch } = req.body;

  if (!pitch || pitch.trim().length < 10) {
    return next(ApiError.badRequest('Pitch is required (minimum 10 characters)'));
  }
  if (pitch.trim().length > 5000) {
    return next(ApiError.badRequest('Pitch must be under 5,000 characters'));
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

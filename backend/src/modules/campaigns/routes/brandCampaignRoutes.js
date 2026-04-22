/**
 * Brand Campaign Routes
 * All routes prefixed with /api/campaigns
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/BrandCampaignController');
const { featureGate } = require('../../entitlements/EntitlementGuard');
const {
  validateCreateCampaign,
  validateStatusTransition,
  validateApplicationStatus,
  validateSubmissionReview,
} = require('../validators/CampaignValidator');

// All campaign routes gated behind feature flag
router.use(featureGate('paid_campaigns'));

// Campaign CRUD
router.post('/', validateCreateCampaign, controller.create.bind(controller));
router.get('/mine', controller.listMine.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));

// Campaign lifecycle
router.post('/:id/publish', controller.publish.bind(controller));
router.post('/:id/transition', validateStatusTransition, controller.transition.bind(controller));

// Applications
router.get('/:id/applications', controller.listApplications.bind(controller));
router.put('/applications/:id/status', validateApplicationStatus, controller.updateApplicationStatus.bind(controller));

// Submissions
router.get('/applications/:id/submissions', controller.getSubmissions.bind(controller));
router.post('/submissions/:id/review', validateSubmissionReview, controller.reviewSubmission.bind(controller));

// Payouts
router.get('/:id/payouts', controller.listPayouts.bind(controller));
router.post('/:id/applications/:appId/payout', controller.createPayout.bind(controller));

module.exports = router;

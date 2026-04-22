/**
 * Creator Campaign Routes
 * All routes prefixed with /api/creator
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/CreatorCampaignController');
const { featureGate, campaignApplyGuard } = require('../../entitlements/EntitlementGuard');
const { validateApplication } = require('../validators/CampaignValidator');

// Campaign browsing (gated behind feature flag)
router.get('/campaigns', featureGate('paid_campaigns'), controller.browse.bind(controller));
router.get('/campaigns/:id', featureGate('paid_campaigns'), controller.viewCampaign.bind(controller));

// Applications (entitlement check happens in campaignApplyGuard)
router.post('/campaigns/:id/apply', featureGate('paid_campaigns'), campaignApplyGuard, validateApplication, controller.apply.bind(controller));
router.get('/applications', controller.myApplications.bind(controller));
router.post('/applications/:id/withdraw', controller.withdraw.bind(controller));

// Deliverable submissions
router.post('/applications/:appId/deliverables/:delId/submit', controller.submitDeliverable.bind(controller));

// Earnings
router.get('/earnings', controller.earnings.bind(controller));

// Entitlements
router.get('/entitlements', controller.getEntitlements.bind(controller));
router.get('/entitlements/:featureKey', controller.checkEntitlement.bind(controller));

module.exports = router;

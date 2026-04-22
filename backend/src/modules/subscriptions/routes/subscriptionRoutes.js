/**
 * Subscription Routes
 * Creator subscription management + Paystack webhook
 */

const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/CreatorSubscriptionController');
const { featureGate } = require('../../entitlements/EntitlementGuard');

// Public: Paystack webhook (no auth)
router.post('/webhooks/paystack', express.raw({ type: 'application/json' }), creatorController.handleWebhook.bind(creatorController));

// Plans (public — needed for upgrade page)
router.get('/creator/plans', creatorController.getPlans.bind(creatorController));

// Subscription management (requires auth + feature flag)
router.get('/creator/subscription', featureGate('creator_subscriptions'), creatorController.getCurrent.bind(creatorController));
router.post('/creator/subscription', featureGate('creator_subscriptions'), creatorController.subscribe.bind(creatorController));
router.post('/creator/subscription/verify', featureGate('creator_subscriptions'), creatorController.verify.bind(creatorController));
router.delete('/creator/subscription', featureGate('creator_subscriptions'), creatorController.cancel.bind(creatorController));

module.exports = router;

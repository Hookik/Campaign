/**
 * Admin Routes
 * Subscription management, feature flags, audit log
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminSubscriptionController');
const adminCampaignController = require('../../campaigns/controllers/AdminCampaignController');

// --- Subscriptions ---
router.get('/subscriptions', adminController.list.bind(adminController));
router.get('/subscriptions/stats', adminController.stats.bind(adminController));
router.post('/subscriptions/comp', adminController.comp.bind(adminController));

// --- Feature Flags ---
router.get('/flags', adminController.listFlags.bind(adminController));
router.put('/flags/:key', adminController.toggleFlag.bind(adminController));

// --- Audit Log ---
router.get('/audit', adminController.auditLog.bind(adminController));

// --- Campaign Moderation ---
router.get('/campaigns', adminCampaignController.list.bind(adminCampaignController));
router.get('/campaigns/stats', adminCampaignController.stats.bind(adminCampaignController));
router.post('/campaigns/:id/moderate', adminCampaignController.moderate.bind(adminCampaignController));
router.post('/payouts/:id/approve', adminCampaignController.approvePayout.bind(adminCampaignController));
router.post('/payouts/:id/process', adminCampaignController.processPayout.bind(adminCampaignController));

module.exports = router;

/**
 * Hookik Express Application
 * Mounts the new campaigns + subscriptions modules alongside existing app.
 *
 * INTEGRATION: Import this file in your existing Express app and mount the router.
 *
 * Example in your existing server.js:
 *   const upgradeRoutes = require('./src/app');
 *   app.use(upgradeRoutes);
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const { requireAuth, requireAdmin, requireBusiness, requireCreator } = require('./middleware/authMiddleware');

// Route imports
const brandCampaignRoutes = require('./modules/campaigns/routes/brandCampaignRoutes');
const creatorCampaignRoutes = require('./modules/campaigns/routes/creatorCampaignRoutes');
const subscriptionRoutes = require('./modules/subscriptions/routes/subscriptionRoutes');
const adminRoutes = require('./modules/subscriptions/routes/adminRoutes');

const router = express.Router();

// ─── PUBLIC ROUTES (no auth) ───
// Paystack webhook + public plan listing
const subscriptionPublicRouter = express.Router();
subscriptionPublicRouter.post('/webhooks/paystack', express.raw({ type: 'application/json' }), require('./modules/subscriptions/controllers/CreatorSubscriptionController').handleWebhook.bind(require('./modules/subscriptions/controllers/CreatorSubscriptionController')));
subscriptionPublicRouter.get('/creator/plans', require('./modules/subscriptions/controllers/CreatorSubscriptionController').getPlans.bind(require('./modules/subscriptions/controllers/CreatorSubscriptionController')));
router.use('/api', subscriptionPublicRouter);

// ─── AUTHENTICATED ROUTES ───
// Brand / Business routes
router.use('/api/campaigns', requireAuth, requireBusiness, brandCampaignRoutes);

// Creator routes (campaign browsing + applications)
router.use('/api/creator', requireAuth, requireCreator, creatorCampaignRoutes);

// Creator subscription routes (auth required)
const subscriptionAuthRouter = express.Router();
const { featureGate } = require('./modules/entitlements/EntitlementGuard');
const subCtrl = require('./modules/subscriptions/controllers/CreatorSubscriptionController');
subscriptionAuthRouter.get('/creator/subscription
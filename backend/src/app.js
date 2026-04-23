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
subscriptionAuthRouter.get('/creator/subscription', featureGate('creator_subscriptions'), subCtrl.getCurrent.bind(subCtrl));
subscriptionAuthRouter.post('/creator/subscription', featureGate('creator_subscriptions'), subCtrl.subscribe.bind(subCtrl));
subscriptionAuthRouter.post('/creator/subscription/verify', featureGate('creator_subscriptions'), subCtrl.verify.bind(subCtrl));
subscriptionAuthRouter.delete('/creator/subscription', featureGate('creator_subscriptions'), subCtrl.cancel.bind(subCtrl));
router.use('/api', requireAuth, requireCreator, subscriptionAuthRouter);

// Admin routes
router.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

// Error handler (must be last)
router.use(errorHandler);

module.exports = router;

/**
 * ─── STANDALONE SERVER (for development/testing) ───
 * If running this module independently:
 *
 *   node src/app.js
 */
if (require.main === module) {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', module: 'hookik-upgrade', timestamp: new Date().toISOString() });
  });

  // ─── DEV AUTH (development only) ───
  const jwt = require('jsonwebtoken');
  const { v4: uuidv4 } = require('uuid');

  app.post('/api/dev/login', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Dev login disabled in production' });
    }
    const { role = 'creator', name = 'Test User' } = req.body;
    const secret = process.env.JWT_SECRET || 'hookik-dev-secret';

    // Fixed IDs so dev users are persistent across logins (enables seeded data)
    const profiles = {
      creator: { id: 'c0000000-0000-0000-0000-000000000001', email: 'creator@hookik.test', role: 'creator', name: 'Demo Creator' },
      business: { id: 'b0000000-0000-0000-0000-000000000001', email: 'brand@hookik.test', role: 'business', businessId: 'biz00000-0000-0000-0000-000000000001', name: 'Demo Brand' },
      admin: { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@hookik.test', role: 'admin', name: 'Demo Admin' },
    };

    const profile = profiles[role] || profiles.creator;
    const token = jwt.sign(profile, secret, { expiresIn: '7d' });

    res.json({ success: true, data: { token, user: profile } });
  });

  app.use(router);

  const PORT = process.env.UPGRADE_PORT || 3001;
  app.listen(PORT, async () => {
    console.log(`\n🚀 Hookik Upgrade Module running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:    http://localhost:${PORT}/api/`);

    // ─── DEV: Auto-enable feature flags ───
    try {
      const { pool } = require('./config/database');
      await pool.execute(
        "UPDATE feature_flags SET is_enabled = TRUE WHERE flag_key IN ('paid_campaigns', 'creator_subscriptions', 'premium_analytics', 'campaign_commission_hybrid')"
      );
      console.log(`   ✅ Feature flags enabled for development\n`);
    } catch (err) {
      console.log(`   ⚠️  Could not enable feature flags: ${err.message}\n`);
    }
  });
}

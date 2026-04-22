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
// Paystack webhook
router.use('/api', subscriptionRoutes);

// ─── AUTHENTICATED ROUTES ───
// Brand / Business routes
router.use('/api/campaigns', requireAuth, requireBusiness, brandCampaignRoutes);

// Creator routes
router.use('/api/creator', requireAuth, requireCreator, creatorCampaignRoutes);

// Subscription routes (creator-facing, needs auth)
router.use('/api', requireAuth, requireCreator, subscriptionRoutes);

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

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', module: 'hookik-upgrade', timestamp: new Date().toISOString() });
  });

  app.use(router);

  const PORT = process.env.UPGRADE_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 Hookik Upgrade Module running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:    http://localhost:${PORT}/api/\n`);
  });
}

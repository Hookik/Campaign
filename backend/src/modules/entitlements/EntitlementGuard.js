/**
 * Entitlement Guard Middleware
 * Express middleware that checks entitlements before route execution.
 *
 * Usage:
 *   router.get('/premium-feature', entitlementGuard('premium_analytics'), controller)
 *   router.post('/campaigns/:id/apply', campaignApplyGuard, controller)
 */

const entitlementService = require('./EntitlementService');
const featureFlagService = require('./FeatureFlagService');
const { ApiError } = require('../../utils/ApiError');

/**
 * Check if creator has access to a specific feature
 */
function entitlementGuard(featureKey) {
  return async (req, res, next) => {
    try {
      const creatorId = req.user?.id;
      if (!creatorId) {
        throw ApiError.unauthorized('Authentication required');
      }

      const check = await entitlementService.canAccess(creatorId, featureKey);

      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          error: 'ENTITLEMENT_DENIED',
          reason: check.reason,
          upgrade_to: check.upgrade_to,
          message:
            check.reason === 'feature_disabled'
              ? 'This feature is not yet available.'
              : `Upgrade to ${check.upgrade_to || 'a higher plan'} to access this feature.`,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Check if a global feature module is enabled
 */
function featureGate(flagKey) {
  return async (req, res, next) => {
    try {
      const enabled = await featureFlagService.isEnabled(flagKey);
      if (!enabled) {
        return res.status(404).json({
          success: false,
          error: 'FEATURE_DISABLED',
          message: 'This feature is not currently available.',
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Check if creator can apply to a specific campaign
 */
async function campaignApplyGuard(req, res, next) {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { pool } = require('../../config/database');
    const [campaigns] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      [req.params.id]
    );

    if (campaigns.length === 0) {
      throw ApiError.notFound('Campaign not found');
    }

    const check = await entitlementService.canApplyToCampaign(
      creatorId,
      campaigns[0]
    );

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        error: 'ENTITLEMENT_DENIED',
        reason: check.reason,
        upgrade_to: check.upgrade_to,
        message:
          check.reason === 'invite_required'
            ? 'This campaign is invite-only.'
            : `Upgrade to ${check.upgrade_to || 'a higher plan'} to apply to this campaign.`,
      });
    }

    req.campaign = campaigns[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { entitlementGuard, featureGate, campaignApplyGuard };

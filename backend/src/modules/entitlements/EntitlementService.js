/**
 * Entitlement Service
 * Single source of truth for "can this user do X?"
 *
 * Pattern: canAccess(), canViewCampaign(), canApplyToCampaign()
 * Returns: { allowed: boolean, reason?: string, upgrade_to?: string }
 */

const { pool } = require('../../config/database');
const featureFlagService = require('./FeatureFlagService');

class EntitlementService {
  /**
   * Core check: does creator's current plan grant this feature?
   */
  async canAccess(creatorId, featureKey) {
    // 1. Check global feature flag
    const flagEnabled = await featureFlagService.isEnabled(featureKey);
    if (!flagEnabled) {
      return { allowed: false, reason: 'feature_disabled' };
    }

    // 2. Get creator's active subscription
    const sub = await this.getActiveSubscription(creatorId);
    const planId = sub ? sub.plan_id : null;
    const planSlug = sub ? sub.plan_slug : 'free';

    // If no subscription exists, treat as free tier
    if (!planId) {
      const freePlan = await this._getFreePlan();
      if (freePlan) {
        const feature = await this._getPlanFeature(freePlan.id, featureKey);
        if (!feature || feature.feature_value === 'false') {
          const upgradePlan = await this._findMinimumPlanFor(featureKey);
          return {
            allowed: false,
            reason: 'plan_required',
            upgrade_to: upgradePlan ? upgradePlan.slug : 'pro',
          };
        }
        return { allowed: true };
      }
    }

    // 3. Look up plan_features for this feature_key
    const feature = await this._getPlanFeature(planId, featureKey);

    if (!feature || feature.feature_value === 'false') {
      const upgradePlan = await this._findMinimumPlanFor(featureKey);
      return {
        allowed: false,
        reason: 'plan_required',
        upgrade_to: upgradePlan ? upgradePlan.slug : null,
      };
    }

    return { allowed: true };
  }

  /**
   * Get the value of a specific feature for a creator's plan
   */
  async getFeatureValue(creatorId, featureKey) {
    const sub = await this.getActiveSubscription(creatorId);
    const planId = sub ? sub.plan_id : (await this._getFreePlan())?.id;
    if (!planId) return null;

    const feature = await this._getPlanFeature(planId, featureKey);
    return feature ? feature.feature_value : null;
  }

  /**
   * Campaign-specific: can creator view this campaign?
   */
  async canViewCampaign(creatorId, campaign) {
    if (campaign.visibility === 'public') return { allowed: true };

    if (campaign.visibility === 'invite_only') {
      const invited = await this._hasInvite(creatorId, campaign.id);
      return invited
        ? { allowed: true }
        : { allowed: false, reason: 'invite_required' };
    }

    if (campaign.visibility === 'premium_only' || campaign.require_pro) {
      return this.canAccess(creatorId, 'paid_campaigns');
    }

    return { allowed: true };
  }

  /**
   * Campaign-specific: can creator apply to this campaign?
   */
  async canApplyToCampaign(creatorId, campaign) {
    const viewCheck = await this.canViewCampaign(creatorId, campaign);
    if (!viewCheck.allowed) return viewCheck;

    if (campaign.require_pro_plus) {
      return this.canAccess(creatorId, 'elite_campaigns');
    }
    if (campaign.require_pro) {
      return this.canAccess(creatorId, 'paid_campaigns');
    }

    return { allowed: true };
  }

  /**
   * Get all entitlements for a creator (for frontend)
   */
  async getAllEntitlements(creatorId) {
    const sub = await this.getActiveSubscription(creatorId);
    const planId = sub ? sub.plan_id : (await this._getFreePlan())?.id;

    if (!planId) return {};

    const [features] = await pool.execute(
      'SELECT feature_key, feature_value FROM plan_features WHERE plan_id = ?',
      [planId]
    );

    const entitlements = {};
    for (const f of features) {
      entitlements[f.feature_key] = f.feature_value;
    }

    return {
      plan: sub ? sub.plan_slug : 'free',
      status: sub ? sub.status : 'active',
      entitlements,
    };
  }

  /**
   * Get active subscription for creator
   */
  async getActiveSubscription(creatorId) {
    const [rows] = await pool.execute(
      `SELECT cs.*, sp.slug as plan_slug, sp.name as plan_name
       FROM creator_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE cs.creator_id = ?
         AND cs.status IN ('active', 'trialing', 'past_due', 'paused', 'comped')
       ORDER BY cs.created_at DESC
       LIMIT 1`,
      [creatorId]
    );
    return rows[0] || null;
  }

  // --- Private helpers ---

  async _getFreePlan() {
    const [rows] = await pool.execute(
      "SELECT * FROM subscription_plans WHERE slug = 'free' LIMIT 1"
    );
    return rows[0] || null;
  }

  async _getPlanFeature(planId, featureKey) {
    if (!planId) return null;
    const [rows] = await pool.execute(
      'SELECT * FROM plan_features WHERE plan_id = ? AND feature_key = ?',
      [planId, featureKey]
    );
    return rows[0] || null;
  }

  async _findMinimumPlanFor(featureKey) {
    const [rows] = await pool.execute(
      `SELECT sp.* FROM subscription_plans sp
       JOIN plan_features pf ON sp.id = pf.plan_id
       WHERE pf.feature_key = ? AND pf.feature_value != 'false'
         AND sp.is_active = TRUE
       ORDER BY sp.sort_order ASC
       LIMIT 1`,
      [featureKey]
    );
    return rows[0] || null;
  }

  async _hasInvite(creatorId, campaignId) {
    const [rows] = await pool.execute(
      `SELECT id FROM campaign_invites
       WHERE creator_id = ? AND campaign_id = ? AND status IN ('pending', 'accepted')
       LIMIT 1`,
      [creatorId, campaignId]
    );
    return rows.length > 0;
  }
}

module.exports = new EntitlementService();

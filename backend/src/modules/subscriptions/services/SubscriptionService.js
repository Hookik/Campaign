/**
 * Subscription Service
 * Manages creator subscription lifecycle: subscribe, upgrade, downgrade, cancel
 */

const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { ApiError } = require('../../../utils/ApiError');
const billingService = require('./BillingService');
const auditService = require('../../audit/AuditService');

class SubscriptionService {
  /**
   * Get all available plans
   */
  async getPlans() {
    const [plans] = await pool.execute(
      'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY sort_order'
    );

    // Attach features to each plan
    for (const plan of plans) {
      const [features] = await pool.execute(
        'SELECT * FROM plan_features WHERE plan_id = ? ORDER BY sort_order',
        [plan.id]
      );
      plan.features = features;
    }

    return plans;
  }

  /**
   * Get a single plan by slug
   */
  async getPlanBySlug(slug) {
    const [rows] = await pool.execute(
      'SELECT * FROM subscription_plans WHERE slug = ?',
      [slug]
    );
    if (rows.length === 0) return null;

    const plan = rows[0];
    const [features] = await pool.execute(
      'SELECT * FROM plan_features WHERE plan_id = ? ORDER BY sort_order',
      [plan.id]
    );
    plan.features = features;

    return plan;
  }

  /**
   * Subscribe a creator to a plan
   */
  async subscribe(creatorId, planSlug, billingCycle = 'monthly') {
    const plan = await this.getPlanBySlug(planSlug);
    if (!plan) throw ApiError.notFound('Plan not found');

    // Don't charge for free plan
    if (plan.slug === 'free') {
      return this._createFreeSubscription(creatorId, plan.id);
    }

    // Check for existing active subscription
    const existing = await this._getActiveSubscription(creatorId);
    if (existing && existing.plan_slug === planSlug) {
      throw ApiError.conflict('Already subscribed to this plan');
    }

    // Get creator email for Paystack
    const [creators] = await pool.execute(
      'SELECT email FROM creators WHERE id = ?',
      [creatorId]
    );
    if (creators.length === 0) throw ApiError.notFound('Creator not found');

    const amount = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    if (!amount) throw ApiError.badRequest('This billing cycle is not available for this plan');

    // Initialize Paystack transaction
    const callbackUrl = `${process.env.FRONTEND_URL}/subscriptions/callback`;
    const paystackPlanCode = plan.metadata?.paystack_plan_code;

    if (paystackPlanCode) {
      // Use Paystack recurring subscription
      const payment = await billingService.initializeSubscription(
        creators[0].email,
        paystackPlanCode,
        callbackUrl
      );
      return {
        authorization_url: payment.authorization_url,
        reference: payment.reference,
        plan: plan,
      };
    }

    // Fallback: one-time payment that we track manually
    const payment = await billingService.initializeSubscription(
      creators[0].email,
      null,
      callbackUrl
    );

    return {
      authorization_url: payment.authorization_url,
      reference: payment.reference,
      plan: plan,
    };
  }

  /**
   * Confirm subscription after payment (webhook or callback)
   */
  async confirmSubscription(creatorId, planSlug, providerSubId, periodEnd) {
    const plan = await this.getPlanBySlug(planSlug);
    if (!plan) throw ApiError.notFound('Plan not found');

    // Cancel any existing active subscription
    const existing = await this._getActiveSubscription(creatorId);
    if (existing) {
      await pool.execute(
        "UPDATE creator_subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?",
        [existing.id]
      );
    }

    const id = generateId();
    const now = new Date();
    const end = periodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    await pool.execute(
      `INSERT INTO creator_subscriptions
        (id, creator_id, plan_id, status, provider_sub_id,
         current_period_start, current_period_end)
       VALUES (?, ?, ?, 'active', ?, ?, ?)`,
      [id, creatorId, plan.id, providerSubId || null, now, end]
    );

    // Update creator tier
    await pool.execute(
      'UPDATE creators SET subscription_tier = ?, is_verified = ? WHERE id = ?',
      [plan.slug, plan.slug !== 'free', creatorId]
    );

    await auditService.log({
      actorId: creatorId,
      actorType: 'creator',
      entityType: 'subscription',
      entityId: id,
      action: 'subscription.activated',
      newState: { plan: plan.slug, status: 'active' },
    });

    return this._getActiveSubscription(creatorId);
  }

  /**
   * Cancel subscription (cancel at period end)
   */
  async cancel(creatorId) {
    const sub = await this._getActiveSubscription(creatorId);
    if (!sub) throw ApiError.notFound('No active subscription');
    if (sub.plan_slug === 'free') {
      throw ApiError.badRequest('Cannot cancel free plan');
    }

    // Cancel via Paystack if applicable
    if (sub.provider_sub_id) {
      try {
        await billingService.disableSubscription(sub.provider_sub_id, sub.email_token);
      } catch (err) {
        console.error('Paystack cancel failed:', err.message);
      }
    }

    await pool.execute(
      `UPDATE creator_subscriptions
       SET cancel_at_period_end = TRUE, cancelled_at = NOW()
       WHERE id = ?`,
      [sub.id]
    );

    await auditService.log({
      actorId: creatorId,
      actorType: 'creator',
      entityType: 'subscription',
      entityId: sub.id,
      action: 'subscription.cancel_scheduled',
      newState: { cancel_at_period_end: true },
    });

    return this._getActiveSubscription(creatorId);
  }

  /**
   * Admin: comp a creator (give them a plan for free)
   */
  async comp(creatorId, planSlug, adminId) {
    const plan = await this.getPlanBySlug(planSlug);
    if (!plan) throw ApiError.notFound('Plan not found');

    const existing = await this._getActiveSubscription(creatorId);
    if (existing) {
      await pool.execute(
        "UPDATE creator_subscriptions SET status = 'cancelled' WHERE id = ?",
        [existing.id]
      );
    }

    const id = generateId();
    await pool.execute(
      `INSERT INTO creator_subscriptions
        (id, creator_id, plan_id, status, assigned_by)
       VALUES (?, ?, ?, 'comped', ?)`,
      [id, creatorId, plan.id, adminId]
    );

    await pool.execute(
      'UPDATE creators SET subscription_tier = ?, is_verified = TRUE WHERE id = ?',
      [plan.slug, creatorId]
    );

    await auditService.log({
      actorId: adminId,
      actorType: 'admin',
      entityType: 'subscription',
      entityId: id,
      action: 'subscription.comped',
      newState: { plan: plan.slug, creator_id: creatorId },
    });

    return this._getActiveSubscription(creatorId);
  }

  /**
   * Get current subscription for a creator
   */
  async getCurrentSubscription(creatorId) {
    return this._getActiveSubscription(creatorId);
  }

  /**
   * Handle expired subscriptions (cron job)
   */
  async processExpirations() {
    const [expired] = await pool.execute(
      `SELECT cs.*, sp.slug as plan_slug
       FROM creator_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE cs.status = 'active'
         AND cs.cancel_at_period_end = TRUE
         AND cs.current_period_end < NOW()`
    );

    for (const sub of expired) {
      await pool.execute(
        "UPDATE creator_subscriptions SET status = 'expired' WHERE id = ?",
        [sub.id]
      );

      await pool.execute(
        "UPDATE creators SET subscription_tier = 'free', is_verified = FALSE WHERE id = ?",
        [sub.creator_id]
      );

      await auditService.log({
        actorType: 'system',
        entityType: 'subscription',
        entityId: sub.id,
        action: 'subscription.expired',
        oldState: { plan: sub.plan_slug, status: 'active' },
        newState: { status: 'expired' },
      });
    }

    return expired.length;
  }

  // --- Private ---

  async _getActiveSubscription(creatorId) {
    const [rows] = await pool.execute(
      `SELECT cs.*, sp.slug as plan_slug, sp.name as plan_name,
              sp.price_monthly, sp.price_annual
       FROM creator_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE cs.creator_id = ?
         AND cs.status IN ('active', 'trialing', 'past_due', 'paused', 'comped')
       ORDER BY cs.created_at DESC LIMIT 1`,
      [creatorId]
    );
    return rows[0] || null;
  }

  async _createFreeSubscription(creatorId, planId) {
    const existing = await this._getActiveSubscription(creatorId);
    if (existing && existing.plan_slug === 'free') return existing;

    const id = generateId();
    await pool.execute(
      `INSERT INTO creator_subscriptions
        (id, creator_id, plan_id, status)
       VALUES (?, ?, ?, 'active')`,
      [id, creatorId, planId]
    );

    await pool.execute(
      "UPDATE creators SET subscription_tier = 'free' WHERE id = ?",
      [creatorId]
    );

    return this._getActiveSubscription(creatorId);
  }
}

module.exports = new SubscriptionService();

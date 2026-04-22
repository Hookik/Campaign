/**
 * Admin Subscription Controller
 * Admin management of subscriptions, plans, and comps
 */

const { pool } = require('../../../config/database');
const subscriptionService = require('../services/SubscriptionService');
const featureFlagService = require('../../entitlements/FeatureFlagService');
const auditService = require('../../audit/AuditService');

class AdminSubscriptionController {
  /**
   * GET /api/admin/subscriptions
   * List all active subscriptions
   */
  async list(req, res, next) {
    try {
      const { status, plan, page = 1, limit = 20 } = req.query;

      let sql = `
        SELECT cs.*, sp.slug as plan_slug, sp.name as plan_name,
               cr.name as creator_name, cr.email as creator_email
        FROM creator_subscriptions cs
        JOIN subscription_plans sp ON cs.plan_id = sp.id
        JOIN creators cr ON cs.creator_id = cr.id
        WHERE 1=1
      `;
      const params = [];

      if (status) { sql += ' AND cs.status = ?'; params.push(status); }
      if (plan) { sql += ' AND sp.slug = ?'; params.push(plan); }

      sql += ' ORDER BY cs.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const [rows] = await pool.execute(sql, params);

      // Counts
      const [counts] = await pool.execute(
        `SELECT cs.status, COUNT(*) as count
         FROM creator_subscriptions cs
         GROUP BY cs.status`
      );

      res.json({
        success: true,
        data: {
          subscriptions: rows,
          counts,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/subscriptions/comp
   * Give a creator a free subscription (comp)
   */
  async comp(req, res, next) {
    try {
      const { creator_id, plan } = req.body;
      const sub = await subscriptionService.comp(creator_id, plan, req.user.id);
      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/subscriptions/stats
   * Subscription analytics
   */
  async stats(req, res, next) {
    try {
      const [planCounts] = await pool.execute(
        `SELECT sp.slug, sp.name, COUNT(cs.id) as subscriber_count
         FROM subscription_plans sp
         LEFT JOIN creator_subscriptions cs ON sp.id = cs.plan_id
           AND cs.status IN ('active', 'trialing', 'comped')
         GROUP BY sp.id
         ORDER BY sp.sort_order`
      );

      const [revenue] = await pool.execute(
        `SELECT
           SUM(CASE WHEN sp.slug = 'pro' THEN sp.price_monthly ELSE 0 END) as pro_mrr,
           SUM(CASE WHEN sp.slug = 'pro_plus' THEN sp.price_monthly ELSE 0 END) as pro_plus_mrr
         FROM creator_subscriptions cs
         JOIN subscription_plans sp ON cs.plan_id = sp.id
         WHERE cs.status IN ('active', 'trialing')`
      );

      const [churn] = await pool.execute(
        `SELECT COUNT(*) as cancelled_this_month
         FROM creator_subscriptions
         WHERE status = 'cancelled'
           AND cancelled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      res.json({
        success: true,
        data: {
          plan_distribution: planCounts,
          estimated_mrr: revenue[0],
          recent_churn: churn[0],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/flags
   * List all feature flags
   */
  async listFlags(req, res, next) {
    try {
      const flags = await featureFlagService.getAll();
      res.json({ success: true, data: flags });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/flags/:key
   * Toggle a feature flag
   */
  async toggleFlag(req, res, next) {
    try {
      const { is_enabled } = req.body;
      const flag = await featureFlagService.toggle(
        req.params.key, is_enabled, req.user.id
      );

      await auditService.log({
        actorId: req.user.id,
        actorType: 'admin',
        entityType: 'feature_flag',
        entityId: req.params.key,
        action: is_enabled ? 'flag.enabled' : 'flag.disabled',
        newState: { flag_key: req.params.key, is_enabled },
        req,
      });

      res.json({ success: true, data: flag });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/audit
   * Query audit log
   */
  async auditLog(req, res, next) {
    try {
      const { entity_type, entity_id, actor_id, action, limit, offset } = req.query;
      const result = await auditService.query({
        entityType: entity_type,
        entityId: entity_id,
        actorId: actor_id,
        action,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminSubscriptionController();

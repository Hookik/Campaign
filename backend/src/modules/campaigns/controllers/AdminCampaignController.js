/**
 * Admin Campaign Controller
 * Campaign moderation and oversight
 */

const { pool } = require('../../../config/database');
const campaignService = require('../services/CampaignService');
const payoutService = require('../services/CampaignPayoutService');
const auditService = require('../../audit/AuditService');

class AdminCampaignController {
  /**
   * GET /api/admin/campaigns
   * List all campaigns with filters
   */
  async list(req, res, next) {
    try {
      const { status, business_id, page = 1, limit = 20 } = req.query;

      let sql = `
        SELECT c.*, b.name as business_name,
          (SELECT COUNT(*) FROM campaign_applications WHERE campaign_id = c.id) as application_count
        FROM campaigns c
        LEFT JOIN businesses b ON c.business_id = b.id
        WHERE 1=1
      `;
      const params = [];

      if (status) { sql += ' AND c.status = ?'; params.push(status); }
      if (business_id) { sql += ' AND c.business_id = ?'; params.push(business_id); }

      sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const [rows] = await pool.execute(sql, params);
      res.json({ success: true, data: { campaigns: rows, page: parseInt(page), limit: parseInt(limit) } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/campaigns/:id/moderate
   * Admin can force-transition campaign status
   */
  async moderate(req, res, next) {
    try {
      const { status: newStatus, reason } = req.body;
      const campaign = await campaignService.transition(
        req.params.id, newStatus, req.user.id, 'admin'
      );

      await auditService.log({
        actorId: req.user.id,
        actorType: 'admin',
        entityType: 'campaign',
        entityId: req.params.id,
        action: 'campaign.moderated',
        newState: { status: newStatus, reason },
        req,
      });

      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/payouts/:id/approve
   * Admin approves a payout
   */
  async approvePayout(req, res, next) {
    try {
      const payout = await payoutService.approve(req.params.id, req.user.id);
      res.json({ success: true, data: payout });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/payouts/:id/process
   * Admin triggers payout processing
   */
  async processPayout(req, res, next) {
    try {
      const payout = await payoutService.process(req.params.id);
      res.json({ success: true, data: payout });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/campaigns/stats
   * Campaign statistics dashboard
   */
  async stats(req, res, next) {
    try {
      const [statusCounts] = await pool.execute(
        'SELECT status, COUNT(*) as count FROM campaigns GROUP BY status'
      );
      const [typeCounts] = await pool.execute(
        'SELECT campaign_type, COUNT(*) as count FROM campaigns GROUP BY campaign_type'
      );
      const [payoutSums] = await pool.execute(
        `SELECT status,
                SUM(amount) as total_amount,
                COUNT(*) as count
         FROM campaign_payouts
         GROUP BY status`
      );

      res.json({
        success: true,
        data: {
          campaigns_by_status: statusCounts,
          campaigns_by_type: typeCounts,
          payouts_by_status: payoutSums,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminCampaignController();

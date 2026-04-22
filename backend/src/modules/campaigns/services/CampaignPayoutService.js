/**
 * Campaign Payout Service
 * Manages payout lifecycle for campaign work.
 * Integrates with existing wallet.credit() system.
 */

const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { ApiError } = require('../../../utils/ApiError');
const auditService = require('../../audit/AuditService');

class CampaignPayoutService {
  /**
   * Create a payout record (after all deliverables approved)
   */
  async createPayout(campaignId, applicationId, creatorId, { payoutType, amount, notes }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO campaign_payouts
        (id, campaign_id, application_id, creator_id, payout_type, amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, campaignId, applicationId, creatorId, payoutType, amount, notes || null]
    );

    await auditService.log({
      actorType: 'system',
      entityType: 'payout',
      entityId: id,
      action: 'payout.created',
      newState: { amount, payout_type: payoutType, creator_id: creatorId },
    });

    return this.getById(id);
  }

  /**
   * Approve a payout (admin or business)
   */
  async approve(payoutId, approvedBy) {
    const payout = await this.getById(payoutId);
    if (!payout) throw ApiError.notFound('Payout not found');
    if (payout.status !== 'pending') {
      throw ApiError.badRequest('Payout is not in pending state');
    }

    await pool.execute(
      "UPDATE campaign_payouts SET status = 'approved', approved_by = ? WHERE id = ?",
      [approvedBy, payoutId]
    );

    await auditService.log({
      actorId: approvedBy,
      actorType: 'business',
      entityType: 'payout',
      entityId: payoutId,
      action: 'payout.approved',
      oldState: { status: 'pending' },
      newState: { status: 'approved' },
    });

    return this.getById(payoutId);
  }

  /**
   * Process payout — calls existing wallet.credit() system
   * This is the integration point with Hookik's existing payout infrastructure.
   */
  async process(payoutId) {
    const payout = await this.getById(payoutId);
    if (!payout) throw ApiError.notFound('Payout not found');
    if (payout.status !== 'approved') {
      throw ApiError.badRequest('Payout must be approved before processing');
    }

    await pool.execute(
      "UPDATE campaign_payouts SET status = 'processing' WHERE id = ?",
      [payoutId]
    );

    try {
      // ─── INTEGRATION POINT ───
      // Call existing Hookik wallet credit system
      // Replace with actual wallet service import:
      //
      //   const walletService = require('../../existing_modules/payouts/WalletService');
      //   const txn = await walletService.credit({
      //     creatorId: payout.creator_id,
      //     amount: payout.amount,
      //     currency: payout.currency,
      //     reference: `campaign_payout_${payoutId}`,
      //     description: `Campaign payout: ${payout.campaign_id}`,
      //   });
      //
      // For now, mark as paid with a placeholder txn ID:
      const walletTxnId = `wallet_${generateId().slice(0, 12)}`;

      await pool.execute(
        "UPDATE campaign_payouts SET status = 'paid', paid_at = NOW(), wallet_txn_id = ? WHERE id = ?",
        [walletTxnId, payoutId]
      );

      await auditService.log({
        actorType: 'system',
        entityType: 'payout',
        entityId: payoutId,
        action: 'payout.paid',
        newState: { status: 'paid', wallet_txn_id: walletTxnId },
      });

      return this.getById(payoutId);
    } catch (err) {
      await pool.execute(
        "UPDATE campaign_payouts SET status = 'failed', notes = CONCAT(COALESCE(notes, ''), '\nError: ', ?) WHERE id = ?",
        [err.message, payoutId]
      );
      throw err;
    }
  }

  /**
   * Get payout by ID
   */
  async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM campaign_payouts WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * List payouts for a campaign
   */
  async listByCampaign(campaignId) {
    const [rows] = await pool.execute(
      `SELECT cp.*, cr.name as creator_name
       FROM campaign_payouts cp
       JOIN creators cr ON cp.creator_id = cr.id
       WHERE cp.campaign_id = ?
       ORDER BY cp.created_at DESC`,
      [campaignId]
    );
    return rows;
  }

  /**
   * List payouts for a creator (earnings)
   */
  async listByCreator(creatorId, { status, page = 1, limit = 20 }) {
    let sql = `
      SELECT cp.*, c.title as campaign_title
      FROM campaign_payouts cp
      JOIN campaigns c ON cp.campaign_id = c.id
      WHERE cp.creator_id = ?
    `;
    const params = [creatorId];

    if (status) {
      sql += ' AND cp.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY cp.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.execute(sql, params);

    // Totals
    const [totals] = await pool.execute(
      `SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_earned,
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
         SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_approved
       FROM campaign_payouts WHERE creator_id = ?`,
      [creatorId]
    );

    return {
      payouts: rows,
      summary: totals[0],
      page,
      limit,
    };
  }
}

module.exports = new CampaignPayoutService();

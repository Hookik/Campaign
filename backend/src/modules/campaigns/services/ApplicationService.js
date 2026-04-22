/**
 * Application Service
 * Handles creator applications to campaigns
 */

const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { ApiError } = require('../../../utils/ApiError');
const auditService = require('../../audit/AuditService');

class ApplicationService {
  /**
   * Creator applies to a campaign
   */
  async apply(campaignId, creatorId, data) {
    // Check campaign is accepting
    const [campaigns] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ? AND status IN ("published", "accepting")',
      [campaignId]
    );
    if (campaigns.length === 0) {
      throw ApiError.badRequest('Campaign is not accepting applications');
    }

    const campaign = campaigns[0];

    // Check deadline
    if (campaign.application_deadline && new Date(campaign.application_deadline) < new Date()) {
      throw ApiError.badRequest('Application deadline has passed');
    }

    // Check max creators
    if (campaign.max_creators) {
      const [countRows] = await pool.execute(
        "SELECT COUNT(*) as cnt FROM campaign_applications WHERE campaign_id = ? AND status = 'accepted'",
        [campaignId]
      );
      if (countRows[0].cnt >= campaign.max_creators) {
        throw ApiError.badRequest('Campaign has reached maximum number of creators');
      }
    }

    // Check if already applied
    const [existing] = await pool.execute(
      'SELECT id FROM campaign_applications WHERE campaign_id = ? AND creator_id = ?',
      [campaignId, creatorId]
    );
    if (existing.length > 0) {
      throw ApiError.conflict('You have already applied to this campaign');
    }

    const id = generateId();
    await pool.execute(
      `INSERT INTO campaign_applications
        (id, campaign_id, creator_id, status, pitch, portfolio_urls, sample_urls, proposed_rate)
       VALUES (?, ?, ?, 'applied', ?, ?, ?, ?)`,
      [
        id, campaignId, creatorId,
        data.pitch || null,
        data.portfolio_urls ? JSON.stringify(data.portfolio_urls) : null,
        data.sample_urls ? JSON.stringify(data.sample_urls) : null,
        data.proposed_rate || null,
      ]
    );

    // Update campaign status to "accepting" if still "published"
    if (campaign.status === 'published') {
      await pool.execute(
        "UPDATE campaigns SET status = 'accepting' WHERE id = ? AND status = 'published'",
        [campaignId]
      );
    }

    await auditService.log({
      actorId: creatorId,
      actorType: 'creator',
      entityType: 'application',
      entityId: id,
      action: 'application.submitted',
      newState: { campaign_id: campaignId },
    });

    return this.getById(id);
  }

  /**
   * Get application by ID
   */
  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT ca.*, c.title as campaign_title, cr.name as creator_name
       FROM campaign_applications ca
       JOIN campaigns c ON ca.campaign_id = c.id
       JOIN creators cr ON ca.creator_id = cr.id
       WHERE ca.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * List applications for a campaign (brand view)
   */
  async listByCampaign(campaignId, { status, page = 1, limit = 20 }) {
    let sql = `
      SELECT ca.*, cr.name as creator_name, cr.handle, cr.profile_image_url,
             cr.subscription_tier, cr.is_verified
      FROM campaign_applications ca
      JOIN creators cr ON ca.creator_id = cr.id
      WHERE ca.campaign_id = ?
    `;
    const params = [campaignId];

    if (status) {
      sql += ' AND ca.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ca.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.execute(sql, params);
    return { applications: rows, page, limit };
  }

  /**
   * List applications by creator (my campaigns)
   */
  async listByCreator(creatorId, { status, page = 1, limit = 20 }) {
    let sql = `
      SELECT ca.*, c.title as campaign_title, c.status as campaign_status,
             b.name as business_name, c.fee_per_creator, c.campaign_type
      FROM campaign_applications ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN businesses b ON c.business_id = b.id
      WHERE ca.creator_id = ?
    `;
    const params = [creatorId];

    if (status) {
      sql += ' AND ca.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ca.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.execute(sql, params);
    return { applications: rows, page, limit };
  }

  /**
   * Update application status (brand action)
   */
  async updateStatus(applicationId, newStatus, reviewerId, brandNotes) {
    const app = await this.getById(applicationId);
    if (!app) throw ApiError.notFound('Application not found');

    const validTransitions = {
      applied: ['shortlisted', 'accepted', 'rejected'],
      shortlisted: ['accepted', 'rejected'],
      accepted: ['cancelled'],
      rejected: [],
      withdrawn: [],
      cancelled: [],
    };

    const allowed = validTransitions[app.status] || [];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition application from '${app.status}' to '${newStatus}'`
      );
    }

    await pool.execute(
      `UPDATE campaign_applications
       SET status = ?, reviewed_at = NOW(), reviewed_by = ?, brand_notes = COALESCE(?, brand_notes)
       WHERE id = ?`,
      [newStatus, reviewerId, brandNotes || null, applicationId]
    );

    await auditService.log({
      actorId: reviewerId,
      actorType: 'business',
      entityType: 'application',
      entityId: applicationId,
      action: `application.${newStatus}`,
      oldState: { status: app.status },
      newState: { status: newStatus },
    });

    return this.getById(applicationId);
  }

  /**
   * Creator withdraws application
   */
  async withdraw(applicationId, creatorId) {
    const app = await this.getById(applicationId);
    if (!app) throw ApiError.notFound('Application not found');
    if (app.creator_id !== creatorId) throw ApiError.forbidden();
    if (!['applied', 'shortlisted'].includes(app.status)) {
      throw ApiError.badRequest('Cannot withdraw at this stage');
    }

    await pool.execute(
      "UPDATE campaign_applications SET status = 'withdrawn' WHERE id = ?",
      [applicationId]
    );

    return this.getById(applicationId);
  }
}

module.exports = new ApplicationService();

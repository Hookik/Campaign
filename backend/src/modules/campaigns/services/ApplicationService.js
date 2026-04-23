/**
 * Application Service - Handles creator applications to campaigns
 */
const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { ApiError } = require('../../../utils/ApiError');
const auditService = require('../../audit/AuditService');

class ApplicationService {
  async apply(campaignId, creatorId, data) {
    const [campaigns] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ? AND status IN ("published", "accepting")', [campaignId]
    );
    if (!campaigns.length) throw ApiError.badRequest('Campaign is not accepting applications');
    const campaign = campaigns[0];
    if (campaign.application_deadline && new Date(campaign.application_deadline) < new Date()) {
      throw ApiError.badRequest('Application deadline has passed');
    }
    if (campaign.max_creators) {
      const [cnt] = await pool.execute(
        "SELECT COUNT(*) as cnt FROM campaign_applications WHERE campaign_id = ? AND status = 'accepted'", [campaignId]
      );
      if (cnt[0].cnt >= campaign.max_creators) throw ApiError.badRequest('Campaign has reached maximum number of creators');
    }
    const [existing] = await pool.execute(
      'SELECT id FROM campaign_applications WHERE campaign_id = ? AND creator_id = ?', [campaignId, creatorId]
    );
    if (existing.length > 0) throw ApiError.conflict('You have already applied to this campaign');
    const id = generateId();
    await pool.execute(
      `INSERT INTO campaign_applications (id, campaign_id, creator_id, status, pitch, portfolio_urls, sample_urls, proposed_rate) VALUES (?, ?, ?, 'applied', ?, ?, ?, ?)`,
      [id, campaignId, creatorId, data.pitch || null, data.portfolio_urls ? JSON.stringify(data.portfolio_urls) : null, data.sample_urls ? JSON.stringify(data.sample_urls) : null, data.proposed_rate || null]
    );
    if (campaign.status === 'published') {
      await pool.execute("UPDATE campaigns SET status = 'accepting' WHERE id = ? AND status = 'published'", [campaignId]);
    }
    await auditService.log({ actorId: creatorId, actorType: 'creator', entityType: 'application', entityId: id, action: 'application.submitted', newState: { campaign_id: campaignId } });
    return this.getById(id);
  }

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT ca.*, c.title as campaign_title, cr.name as creator_name FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id JOIN creators cr ON ca.creator_id = cr.id WHERE ca.id = ?`, [id]
    );
    return rows[0] || null;
  }

  async listByCampaign(campaignId, { status, page = 1, limit = 20 }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    let sql = `SELECT ca.*, cr.display_name as creator_name, cr.name, cr.handle, cr.profile_image_url, cr.niche, cr.follower_count, cr.subscription_tier, cr.is_verified FROM campaign_applications ca JOIN creators cr ON ca.creator_id = cr.id WHERE ca.campaign_id = ?`;
    const params = [campaignId];
    if (status) { sql += ' AND ca.status = ?'; params.push(status); }
    sql += ` ORDER BY ca.created_at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    const [rows] = await pool.query(sql, params);
    return { applications: rows, page, limit };
  }

  async listByCreator(creatorId, { status, page = 1, limit = 20 }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    let sql = `SELECT ca.*, c.title as campaign_title, c.status as campaign_status, c.campaign_type, c.fee_per_creator, c.commission_rate, c.commission_on_top, b.name as business_name FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id JOIN businesses b ON c.business_id = b.id WHERE ca.creator_id = ?`;
    const params = [creatorId];
    if (status) { sql += ' AND ca.status = ?'; params.push(status); }
    sql += ` ORDER BY ca.created_at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    const [rows] = await pool.query(sql, params);
    return { applications: rows, page, limit };
  }

  async updateStatus(applicationId, newStatus, reviewerId, brandNotes) {
    const app = await this.getById(applicationId);
    if (!app) throw ApiError.notFound('Application not found');
    const valid = { applied: ['shortlisted','accepted','rejected'], shortlisted: ['accepted','rejected'], accepted: ['cancelled'], rejected: [], withdrawn: [], cancelled: [] };
    const allowed = valid[app.status] || [];
    if (!allowed.includes(newStatus)) throw ApiError.badRequest('Cannot transition application from ' + app.status + ' to ' + newStatus);
    await pool.execute('UPDATE campaign_applications SET status = ?, reviewed_at = NOW(), reviewed_by = ?, brand_notes = COALESCE(?, brand_notes) WHERE id = ?', [newStatus, reviewerId, brandNotes || null, applicationId]);
    if (newStatus === 'accepted') { await this._autoAddStorefrontProducts(app.campaign_id, app.creator_id); }
    await auditService.log({ actorId: reviewerId, actorType: 'business', entityType: 'application', entityId: applicationId, action: 'application.' + newStatus, oldState: { status: app.status }, newState: { status: newStatus } });
    return this.getById(applicationId);
  }

  async _autoAddStorefrontProducts(cId, crId) {
    try {
      const [c] = await pool.execute('SELECT commission_on_top, commission_rate FROM campaigns WHERE id = ?', [cId]);
      if (!c.length || !c[0].commission_on_top) return;
      const rate = c[0].commission_rate;
      const [cp] = await pool.execute('SELECT product_id FROM campaign_products WHERE campaign_id = ?', [cId]);
      if (!cp.length) return;
      const pids = cp.map(function(p){return p.product_id;});
      const ph = pids.map(function(){return '?';}).join(',');
      const [ex] = await pool.execute('SELECT product_id FROM storefront_products WHERE creator_id = ? AND product_id IN (' + ph + ')', [crId].concat(pids));
      var exSet = {}; ex.forEach(function(e){exSet[e.product_id]=true;});
      var added = 0;
      for (var i = 0; i < pids.length; i++) {
        if (exSet[pids[i]]) continue;
        try {
          await pool.execute('INSERT INTO storefront_products (id, creator_id, product_id, commission_rate, source, source_campaign_id) VALUES (?, ?, ?, ?, ?, ?)', [generateId(), crId, pids[i], rate, 'campaign', cId]);
          added++;
        } catch (ie) { if (ie.code !== 'ER_DUP_ENTRY') console.error('[HYBRID] insert err:', ie.message); }
      }
      if (added > 0) {
        await auditService.log({ actorId: crId, actorType: 'system', entityType: 'storefront', entityId: crId, action: 'storefront.products_auto_added', newState: { campaign_id: cId, products_added: added, commission_rate: rate } });
        console.log('[HYBRID] Auto-added ' + added + ' product
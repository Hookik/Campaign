/**
 * Campaign Service
 * Core business logic for campaign CRUD and lifecycle
 */

const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { slugify } = require('../../../utils/slugify');
const { ApiError } = require('../../../utils/ApiError');
const auditService = require('../../audit/AuditService');

class CampaignService {
  /**
   * Create a new campaign (starts as draft)
   */
  async create(businessId, data) {
    const id = generateId();
    const slug = slugify(data.title) + '-' + id.slice(0, 8);

    await pool.execute(
      `INSERT INTO campaigns
        (id, business_id, title, slug, brief, campaign_type, visibility, status,
         budget_type, fee_per_creator, fee_min, fee_max, total_budget,
         commission_on_top, commission_rate, max_creators,
         application_deadline, content_deadline, review_rules, approval_rules,
         allow_negotiation, require_pro, require_pro_plus, cover_image_url, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, businessId, data.title, slug, data.brief || null,
        data.campaign_type, data.visibility || 'public',
        data.budget_type || 'flat',
        data.fee_per_creator || null, data.fee_min || null,
        data.fee_max || null, data.total_budget || null,
        data.commission_on_top || false, data.commission_rate || null,
        data.max_creators || null,
        data.application_deadline || null, data.content_deadline || null,
        data.review_rules || null, data.approval_rules || null,
        data.allow_negotiation || false,
        data.require_pro || false, data.require_pro_plus || false,
        data.cover_image_url || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );

    // Attach products
    if (data.product_ids?.length) {
      for (const productId of data.product_ids) {
        await pool.execute(
          'INSERT INTO campaign_products (id, campaign_id, product_id) VALUES (?, ?, ?)',
          [generateId(), id, productId]
        );
      }
    }

    // Attach requirements
    if (data.requirements?.length) {
      for (const req of data.requirements) {
        await pool.execute(
          'INSERT INTO campaign_requirements (id, campaign_id, req_type, req_value, is_required) VALUES (?, ?, ?, ?, ?)',
          [generateId(), id, req.req_type, req.req_value, req.is_required !== false]
        );
      }
    }

    // Attach deliverables
    if (data.deliverables?.length) {
      for (let i = 0; i < data.deliverables.length; i++) {
        const del = data.deliverables[i];
        await pool.execute(
          'INSERT INTO campaign_deliverables (id, campaign_id, title, description, deliverable_type, quantity, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [generateId(), id, del.title, del.description || null, del.deliverable_type || null, del.quantity || 1, i]
        );
      }
    }

    await auditService.log({
      actorId: businessId,
      actorType: 'business',
      entityType: 'campaign',
      entityId: id,
      action: 'campaign.created',
      newState: { title: data.title, campaign_type: data.campaign_type },
    });

    return this.getById(id);
  }

  /**
   * Get campaign by ID with relations
   */
  async getById(id) {
    const [campaigns] = await pool.execute(
      `SELECT c.*, b.name as business_name
       FROM campaigns c
       LEFT JOIN businesses b ON c.business_id = b.id
       WHERE c.id = ?`,
      [id]
    );

    if (campaigns.length === 0) return null;

    const campaign = campaigns[0];

    // Fetch products
    const [products] = await pool.execute(
      `SELECT cp.*, p.name as product_name, p.price, p.image_url
       FROM campaign_products cp
       JOIN products p ON cp.product_id = p.id
       WHERE cp.campaign_id = ?`,
      [id]
    );
    campaign.products = products;

    // Fetch requirements
    const [requirements] = await pool.execute(
      'SELECT * FROM campaign_requirements WHERE campaign_id = ? ORDER BY req_type',
      [id]
    );
    campaign.requirements = requirements;

    // Fetch deliverables
    const [deliverables] = await pool.execute(
      'SELECT * FROM campaign_deliverables WHERE campaign_id = ? ORDER BY sort_order',
      [id]
    );
    campaign.deliverables = deliverables;

    return campaign;
  }

  /**
   * List campaigns with filters (for brand)
   */
  async listByBusiness(businessId, { status, page = 1, limit = 20 }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    let sql = 'SELECT * FROM campaigns WHERE business_id = ?';
    const params = [businessId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt((page - 1) * limit)}`;

    const [rows] = await pool.query(sql, params);

    // Count
    let countSql = 'SELECT COUNT(*) as total FROM campaigns WHERE business_id = ?';
    const countParams = [businessId];
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    const [countRows] = await pool.execute(countSql, countParams);

    return { campaigns: rows, total: countRows[0].total, page, limit };
  }

  /**
   * List campaigns visible to a creator (public browse)
   */
  async listForCreator(creatorId, { page = 1, limit = 20, search, campaign_type }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    let sql = `
      SELECT c.*, b.name as business_name
      FROM campaigns c
      LEFT JOIN businesses b ON c.business_id = b.id
      WHERE c.status IN ('published', 'accepting')
    `;
    const params = [];

    if (search) {
      sql += " AND (c.title LIKE ? OR c.brief LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (campaign_type) {
      sql += ' AND c.campaign_type = ?';
      params.push(campaign_type);
    }

    sql += ` ORDER BY c.published_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt((page - 1) * limit)}`;

    const [rows] = await pool.query(sql, params);

    return { campaigns: rows, page, limit };
  }

  /**
   * Update campaign (only if in draft or published state)
   */
  async update(id, businessId, data) {
    const campaign = await this.getById(id);
    if (!campaign) throw ApiError.notFound('Campaign not found');
    if (campaign.business_id !== businessId) throw ApiError.forbidden('Not your campaign');
    if (!['draft', 'published'].includes(campaign.status)) {
      throw ApiError.badRequest('Campaign cannot be edited in its current state');
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      'title', 'brief', 'campaign_type', 'visibility', 'budget_type',
      'fee_per_creator', 'fee_min', 'fee_max', 'total_budget',
      'commission_on_top', 'commission_rate', 'max_creators',
      'application_deadline', 'content_deadline', 'review_rules',
      'approval_rules', 'allow_negotiation', 'require_pro',
      'require_pro_plus', 'cover_image_url',
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    await auditService.log({
      actorId: businessId,
      actorType: 'business',
      entityType: 'campaign',
      entityId: id,
      action: 'campaign.updated',
      oldState: { status: campaign.status },
      newState: data,
    });

    return this.getById(id);
  }

  /**
   * Publish a campaign (draft → published)
   */
  async publish(id, businessId) {
    const campaign = await this.getById(id);
    if (!campaign) throw ApiError.notFound('Campaign not found');
    if (campaign.business_id !== businessId) throw ApiError.forbidden();
    if (campaign.status !== 'draft') {
      throw ApiError.badRequest('Only draft campaigns can be published');
    }

    await pool.execute(
      "UPDATE campaigns SET status = 'published', published_at = NOW() WHERE id = ?",
      [id]
    );

    await auditService.log({
      actorId: businessId,
      actorType: 'business',
      entityType: 'campaign',
      entityId: id,
      action: 'campaign.published',
      oldState: { status: 'draft' },
      newState: { status: 'published' },
    });

    return this.getById(id);
  }

  /**
   * Transition campaign status
   */
  async transition(id, newStatus, actorId, actorType) {
    const campaign = await this.getById(id);
    if (!campaign) throw ApiError.notFound('Campaign not found');

    const validTransitions = {
      draft: ['published', 'cancelled'],
      published: ['accepting', 'cancelled', 'expired'],
      accepting: ['reviewing', 'in_progress', 'cancelled'],
      reviewing: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: ['archived'],
      cancelled: ['archived'],
      expired: ['archived'],
    };

    const allowed = validTransitions[campaign.status] || [];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from '${campaign.status}' to '${newStatus}'`
      );
    }

    const updates = { status: newStatus };
    if (newStatus === 'published') updates.published_at = new Date();

    await pool.execute(
      'UPDATE campaigns SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    await auditService.log({
      actorId,
      actorType,
      entityType: 'campaign',
      entityId: id,
      action: `campaign.${newStatus}`,
      oldState: { status: campaign.s
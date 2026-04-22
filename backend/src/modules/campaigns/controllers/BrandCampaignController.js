/**
 * Brand Campaign Controller
 * Handles all brand-side campaign operations
 */

const campaignService = require('../services/CampaignService');
const applicationService = require('../services/ApplicationService');
const deliverableService = require('../services/DeliverableService');
const payoutService = require('../services/CampaignPayoutService');

class BrandCampaignController {
  /**
   * POST /api/campaigns
   * Create a new campaign
   */
  async create(req, res, next) {
    try {
      const businessId = req.user.businessId;
      const campaign = await campaignService.create(businessId, req.body);
      res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/campaigns/mine
   * List campaigns for the authenticated brand
   */
  async listMine(req, res, next) {
    try {
      const businessId = req.user.businessId;
      const { status, page, limit } = req.query;
      const result = await campaignService.listByBusiness(businessId, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/campaigns/:id
   * Get campaign details
   */
  async getById(req, res, next) {
    try {
      const campaign = await campaignService.getById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }
      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/campaigns/:id
   * Update campaign
   */
  async update(req, res, next) {
    try {
      const businessId = req.user.businessId;
      const campaign = await campaignService.update(req.params.id, businessId, req.body);
      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/campaigns/:id/publish
   * Publish a draft campaign
   */
  async publish(req, res, next) {
    try {
      const businessId = req.user.businessId;
      const campaign = await campaignService.publish(req.params.id, businessId);
      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/campaigns/:id/transition
   * Transition campaign to a new status
   */
  async transition(req, res, next) {
    try {
      const { status: newStatus } = req.body;
      const campaign = await campaignService.transition(
        req.params.id, newStatus, req.user.businessId, 'business'
      );
      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/campaigns/:id/applications
   * List applications for a campaign
   */
  async listApplications(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await applicationService.listByCampaign(req.params.id, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/campaigns/applications/:id/status
   * Accept/reject/shortlist an application
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const { status: newStatus, brand_notes } = req.body;
      const app = await applicationService.updateStatus(
        req.params.id, newStatus, req.user.id, brand_notes
      );
      res.json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/campaigns/applications/:id/submissions
   * Get submissions for an application
   */
  async getSubmissions(req, res, next) {
    try {
      const submissions = await deliverableService.getByApplication(req.params.id);
      res.json({ success: true, data: submissions });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/campaigns/submissions/:id/review
   * Review a submission
   */
  async reviewSubmission(req, res, next) {
    try {
      const { action, feedback } = req.body;
      const submission = await deliverableService.review(
        req.params.id, req.user.id, action, feedback
      );
      res.json({ success: true, data: submission });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/campaigns/:id/applications/:appId/payout
   * Create a payout for accepted work
   */
  async createPayout(req, res, next) {
    try {
      const { payout_type, amount, notes } = req.body;
      const payout = await payoutService.createPayout(
        req.params.id, req.params.appId, req.body.creator_id,
        { payoutType: payout_type, amount, notes }
      );
      res.status(201).json({ success: true, data: payout });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/campaigns/:id/payouts
   * List payouts for a campaign
   */
  async listPayouts(req, res, next) {
    try {
      const payouts = await payoutService.listByCampaign(req.params.id);
      res.json({ success: true, data: payouts });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BrandCampaignController();

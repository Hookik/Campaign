/**
 * Creator Campaign Controller
 * Handles all creator-side campaign operations
 */

const campaignService = require('../services/CampaignService');
const applicationService = require('../services/ApplicationService');
const deliverableService = require('../services/DeliverableService');
const payoutService = require('../services/CampaignPayoutService');
const entitlementService = require('../../entitlements/EntitlementService');

class CreatorCampaignController {
  /**
   * GET /api/creator/campaigns
   * Browse available campaigns
   */
  async browse(req, res, next) {
    try {
      const { page, limit, search, campaign_type } = req.query;
      const result = await campaignService.listForCreator(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
        campaign_type,
      });

      // Enrich with entitlement info
      for (const campaign of result.campaigns) {
        const viewCheck = await entitlementService.canViewCampaign(req.user.id, campaign);
        const applyCheck = await entitlementService.canApplyToCampaign(req.user.id, campaign);
        campaign.can_view = viewCheck.allowed;
        campaign.can_apply = applyCheck.allowed;
        campaign.view_reason = viewCheck.reason;
        campaign.apply_reason = applyCheck.reason;
        campaign.upgrade_to = applyCheck.upgrade_to || viewCheck.upgrade_to;
      }

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/creator/campaigns/:id
   * View campaign details
   */
  async viewCampaign(req, res, next) {
    try {
      const campaign = await campaignService.getById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      // Check entitlement
      const viewCheck = await entitlementService.canViewCampaign(req.user.id, campaign);
      if (!viewCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: 'ENTITLEMENT_DENIED',
          reason: viewCheck.reason,
          upgrade_to: viewCheck.upgrade_to,
          // Return limited campaign data (teaser)
          data: {
            id: campaign.id,
            title: campaign.title,
            business_name: campaign.business_name,
            campaign_type: campaign.campaign_type,
            cover_image_url: campaign.cover_image_url,
            locked: true,
          },
        });
      }

      const applyCheck = await entitlementService.canApplyToCampaign(req.user.id, campaign);
      campaign.can_apply = applyCheck.allowed;
      campaign.apply_reason = applyCheck.reason;
      campaign.upgrade_to = applyCheck.upgrade_to;

      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/creator/campaigns/:id/apply
   * Apply to a campaign
   */
  async apply(req, res, next) {
    try {
      const application = await applicationService.apply(
        req.params.id, req.user.id, req.body
      );
      res.status(201).json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/creator/applications
   * List my applications
   */
  async myApplications(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await applicationService.listByCreator(req.user.id, {
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
   * POST /api/creator/applications/:id/withdraw
   * Withdraw an application
   */
  async withdraw(req, res, next) {
    try {
      const app = await applicationService.withdraw(req.params.id, req.user.id);
      res.json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/creator/applications/:appId/deliverables/:delId/submit
   * Submit a deliverable
   */
  async submitDeliverable(req, res, next) {
    try {
      const submission = await deliverableService.submit(
        req.params.appId, req.params.delId, req.user.id, req.body
      );
      res.status(201).json({ success: true, data: submission });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/creator/earnings
   * Get earnings summary
   */
  async earnings(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await payoutService.listByCreator(req.user.id, {
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
   * GET /api/creator/entitlements
   * Get all entitlements for current user
   */
  async getEntitlements(req, res, next) {
    try {
      const entitlements = await entitlementService.getAllEntitlements(req.user.id);
      res.json({ success: true, data: entitlements });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/creator/entitlements/:featureKey
   * Check a specific entitlement
   */
  async checkEntitlement(req, res, next) {
    try {
      const check = await entitlementService.canAccess(req.user.id, req.params.featureKey);
      res.json({ success: true, data: check });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CreatorCampaignController();

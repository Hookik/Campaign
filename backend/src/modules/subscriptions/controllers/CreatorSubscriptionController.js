/**
 * Creator Subscription Controller
 * Handles plan browsing, subscribing, cancelling
 */

const subscriptionService = require('../services/SubscriptionService');
const billingService = require('../services/BillingService');
const crypto = require('crypto');

class CreatorSubscriptionController {
  /**
   * GET /api/creator/plans
   * List all available plans
   */
  async getPlans(req, res, next) {
    try {
      const plans = await subscriptionService.getPlans();
      res.json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/creator/subscription
   * Get current subscription
   */
  async getCurrent(req, res, next) {
    try {
      const sub = await subscriptionService.getCurrentSubscription(req.user.id);
      res.json({ success: true, data: sub || { plan_slug: 'free', status: 'active' } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/creator/subscription
   * Subscribe to a plan (initiates Paystack payment)
   */
  async subscribe(req, res, next) {
    try {
      const { plan, billing_cycle } = req.body;
      const result = await subscriptionService.subscribe(
        req.user.id, plan, billing_cycle || 'monthly'
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/creator/subscription/verify
   * Verify payment and activate subscription
   */
  async verify(req, res, next) {
    try {
      const { reference, plan } = req.body;
      const txn = await billingService.verifyTransaction(reference);

      if (txn.status !== 'success') {
        return res.status(400).json({
          success: false,
          error: 'Payment not successful',
          data: { status: txn.status },
        });
      }

      const sub = await subscriptionService.confirmSubscription(
        req.user.id,
        plan,
        txn.subscription?.subscription_code || null,
        txn.subscription?.next_payment_date || null
      );

      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/creator/subscription
   * Cancel subscription (at period end)
   */
  async cancel(req, res, next) {
    try {
      const sub = await subscriptionService.cancel(req.user.id);
      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/webhooks/paystack
   * Handle Paystack webhook events
   */
  async handleWebhook(req, res, next) {
    try {
      // Verify webhook signature
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const result = await billingService.handleWebhook(req.body);

      switch (result.action) {
        case 'charge_success': {
          // Subscription renewal success
          const { customer, plan } = result.data;
          if (plan) {
            // Find creator by email and activate
            const { pool } = require('../../../config/database');
            const [creators] = await pool.execute(
              'SELECT id FROM creators WHERE email = ?',
              [customer.email]
            );
            if (creators.length > 0) {
              // Determine plan slug from Paystack plan
              await subscriptionService.confirmSubscription(
                creators[0].id,
                plan.plan_code, // Map this to your plan slug
                result.data.subscription?.subscription_code,
                result.data.subscription?.next_payment_date
              );
            }
          }
          break;
        }
        case 'payment_failed': {
          const { pool } = require('../../../config/database');
          // Mark subscription as past_due
          const [subs] = await pool.execute(
            "SELECT cs.id FROM creator_subscriptions cs WHERE cs.provider_sub_id = ? AND cs.status = 'active'",
            [result.data.subscription?.subscription_code]
          );
          if (subs.length > 0) {
            await pool.execute(
              "UPDATE creator_subscriptions SET status = 'past_due', grace_period_end = DATE_ADD(NOW(), INTERVAL 3 DAY) WHERE id = ?",
              [subs[0].id]
            );
          }
          break;
        }
        case 'subscription_cancelled':
        case 'subscription_disabled': {
          const { pool } = require('../../../config/database');
          await pool.execute(
            "UPDATE creator_subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE provider_sub_id = ?",
            [result.data.subscription_code || result.data.code]
          );
          break;
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(200).json({ received: true }); // Always return 200 for webhooks
    }
  }
}

module.exports = new CreatorSubscriptionController();

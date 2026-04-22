/**
 * Billing Service
 * Handles Paystack subscription billing lifecycle
 */

const { paystackApi } = require('../../../config/paystack');
const { ApiError } = require('../../../utils/ApiError');

class BillingService {
  /**
   * Initialize a subscription payment via Paystack
   */
  async initializeSubscription(email, planCode, callbackUrl) {
    try {
      const response = await paystackApi.post('/transaction/initialize', {
        email,
        plan: planCode,
        callback_url: callbackUrl,
        channels: ['card'],
        metadata: {
          custom_fields: [
            { display_name: 'Subscription', variable_name: 'subscription', value: 'true' },
          ],
        },
      });
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to initialize payment: ' + (err.response?.data?.message || err.message));
    }
  }

  /**
   * Create a Paystack plan (one-time setup)
   */
  async createPlan({ name, amount, interval }) {
    try {
      const response = await paystackApi.post('/plan', {
        name,
        amount: Math.round(amount * 100), // Paystack uses kobo
        interval: interval || 'monthly',
        currency: 'NGN',
      });
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to create plan: ' + (err.response?.data?.message || err.message));
    }
  }

  /**
   * Fetch subscription status from Paystack
   */
  async getSubscription(subscriptionCode) {
    try {
      const response = await paystackApi.get(`/subscription/${subscriptionCode}`);
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to fetch subscription');
    }
  }

  /**
   * Enable a subscription
   */
  async enableSubscription(subscriptionCode, emailToken) {
    try {
      const response = await paystackApi.post('/subscription/enable', {
        code: subscriptionCode,
        token: emailToken,
      });
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to enable subscription');
    }
  }

  /**
   * Disable (cancel) a subscription
   */
  async disableSubscription(subscriptionCode, emailToken) {
    try {
      const response = await paystackApi.post('/subscription/disable', {
        code: subscriptionCode,
        token: emailToken,
      });
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to cancel subscription');
    }
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await paystackApi.get(`/transaction/verify/${reference}`);
      return response.data.data;
    } catch (err) {
      throw ApiError.internal('Failed to verify transaction');
    }
  }

  /**
   * Handle Paystack webhook event
   */
  async handleWebhook(event) {
    const eventType = event.event;
    const data = event.data;

    switch (eventType) {
      case 'subscription.create':
        return { action: 'subscription_created', data };
      case 'charge.success':
        return { action: 'charge_success', data };
      case 'subscription.not_renew':
        return { action: 'subscription_cancelled', data };
      case 'invoice.payment_failed':
        return { action: 'payment_failed', data };
      case 'subscription.disable':
        return { action: 'subscription_disabled', data };
      default:
        return { action: 'unknown', data };
    }
  }
}

module.exports = new BillingService();

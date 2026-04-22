/**
 * Paystack Configuration
 * Handles subscription billing via Paystack
 */

const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackApi = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

module.exports = { paystackApi, PAYSTACK_SECRET, PAYSTACK_BASE_URL };

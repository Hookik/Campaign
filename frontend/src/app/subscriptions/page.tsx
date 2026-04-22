/**
 * Subscriptions / Upgrade Page
 */

'use client';

import React from 'react';
import PricingPlans from '@/components/subscriptions/PricingPlans';

export default function SubscriptionsPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <PricingPlans token={token} />
    </div>
  );
}

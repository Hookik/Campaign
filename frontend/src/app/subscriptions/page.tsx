/**
 * Subscriptions / Upgrade Page
 */

'use client';

import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import PricingPlans from '@/components/subscriptions/PricingPlans';

export default function SubscriptionsPage() {
  const { token } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <PricingPlans token={token || ''} />
    </div>
  );
}

/**
 * Subscription Hook
 * Manages subscription state and actions
 */

'use client';

import { useState, useEffect } from 'react';
import { subscriptionApi } from '@/services/subscriptionService';
import type { SubscriptionPlan, CreatorSubscription } from '@/types';

export function useSubscription(token: string | null) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<CreatorSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const plansRes = await subscriptionApi.getPlans();
        setPlans(plansRes.data as unknown as SubscriptionPlan[]);

        if (token) {
          const subRes = await subscriptionApi.getCurrent(token);
          setCurrentSub(subRes.data as unknown as CreatorSubscription);
        }
      } catch (err) {
        console.error('Failed to fetch subscription data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const subscribe = async (planSlug: string, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    if (!token) throw new Error('Not authenticated');
    const res = await subscriptionApi.subscribe(planSlug, billingCycle, token);
    // Redirect to Paystack checkout
    if (res.data && 'authorization_url' in (res.data as any)) {
      window.location.href = (res.data as any).authorization_url;
    }
    return res;
  };

  const verifyPayment = async (reference: string, plan: string) => {
    if (!token) throw new Error('Not authenticated');
    const res = await subscriptionApi.verify(reference, plan, token);
    setCurrentSub(res.data as unknown as CreatorSubscription);
    return res;
  };

  const cancel = async () => {
    if (!token) throw new Error('Not authenticated');
    const res = await subscriptionApi.cancel(token);
    setCurrentSub(res.data as unknown as CreatorSubscription);
    return res;
  };

  return {
    plans,
    currentSub,
    loading,
    subscribe,
    verifyPayment,
    cancel,
    currentPlan: currentSub?.plan_slug || 'free',
  };
}

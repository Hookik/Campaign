/**
 * Entitlement Hook
 * Provides entitlement checks for UI gating
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { creatorCampaignApi } from '@/services/campaignService';
import type { CreatorEntitlements } from '@/types';

export function useEntitlements(token: string | null) {
  const [entitlements, setEntitlements] = useState<CreatorEntitlements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetch() {
      try {
        const res = await creatorCampaignApi.getEntitlements(token!);
        setEntitlements(res.data as unknown as CreatorEntitlements);
      } catch (err) {
        console.error('Failed to fetch entitlements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [token]);

  const canAccess = useCallback(
    (featureKey: string): boolean => {
      if (!entitlements) return false;
      const value = entitlements.entitlements[featureKey];
      return value !== undefined && value !== 'false';
    },
    [entitlements]
  );

  const getFeatureValue = useCallback(
    (featureKey: string): string | null => {
      if (!entitlements) return null;
      return entitlements.entitlements[featureKey] || null;
    },
    [entitlements]
  );

  return {
    entitlements,
    loading,
    canAccess,
    getFeatureValue,
    plan: entitlements?.plan || 'free',
    isPro: entitlements?.plan === 'pro' || entitlements?.plan === 'pro_plus',
    isProPlus: entitlements?.plan === 'pro_plus',
  };
}

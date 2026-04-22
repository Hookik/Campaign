/**
 * Upgrade Gate Component
 * Wraps content that requires a specific entitlement.
 * Shows upgrade prompt if user doesn't have access.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useEntitlements } from '@/hooks/useEntitlements';

interface UpgradeGateProps {
  featureKey: string;
  token: string | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  blurContent?: boolean;
}

export default function UpgradeGate({
  featureKey,
  token,
  children,
  fallback,
  blurContent = false,
}: UpgradeGateProps) {
  const { canAccess, loading, plan } = useEntitlements(token);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-8 min-h-[200px]" />
    );
  }

  if (canAccess(featureKey)) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) return <>{fallback}</>;

  // Default upgrade prompt
  return (
    <div className="relative">
      {blurContent && (
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
      )}
      <div className={`${blurContent ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center" style={{ borderColor: '#D4C4F0' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F2F5FF' }}>
            <svg className="w-8 h-8" style={{ color: '#5F28A5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Upgrade to Unlock
          </h3>
          <p className="text-gray-600 mb-6">
            This feature requires a higher plan. Upgrade now to access paid campaigns,
            premium analytics, and more.
          </p>
          <Link
            href="/subscriptions"
            className="btn-primary inline-block"
          >
            View Plans
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            Current plan: <span className="capitalize font-medium">{plan}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Campaigns Page
 * Creator: Browse campaigns
 * Brand: Manage campaigns
 * Uses tabs for different views based on user role
 */

'use client';

import React from 'react';
import CampaignBrowse from '@/components/campaigns/CampaignBrowse';

// NOTE: Replace with your actual auth hook/context
// import { useAuth } from '@/hooks/useAuth';

export default function CampaignsPage() {
  // TODO: Replace with your actual auth context
  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CampaignBrowse token={token} />
    </div>
  );
}

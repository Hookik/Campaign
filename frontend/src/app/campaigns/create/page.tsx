/**
 * Create Campaign Page (Brand)
 */

'use client';

import React from 'react';
import CampaignCreateForm from '@/components/campaigns/CampaignCreateForm';

export default function CreateCampaignPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CampaignCreateForm token={token} />
    </div>
  );
}

/**
 * Create Campaign Page (Brand)
 */

'use client';

import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import CampaignCreateForm from '@/components/campaigns/CampaignCreateForm';

export default function CreateCampaignPage() {
  const { token } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CampaignCreateForm token={token || ''} />
    </div>
  );
}

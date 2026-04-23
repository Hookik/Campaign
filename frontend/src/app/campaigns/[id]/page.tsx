/**
 * Campaign Detail Page
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import CampaignDetail from '@/components/campaigns/CampaignDetail';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { token } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CampaignDetail campaignId={campaignId} token={token || ''} />
    </div>
  );
}

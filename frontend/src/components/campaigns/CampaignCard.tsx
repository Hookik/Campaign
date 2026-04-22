/**
 * Campaign Card Component
 * Used in campaign browse grid (creator view)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/shared/StatusBadge';
import type { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  locked?: boolean;
}

export default function CampaignCard({ campaign, locked = false }: CampaignCardProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const isLocked = locked || campaign.locked || (!campaign.can_view && campaign.can_view !== undefined);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${isLocked ? 'opacity-80' : ''}`}>
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-500 relative">
        {campaign.cover_image_url && (
          <img
            src={campaign.cover_image_url}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-semibold text-purple-700">Pro Required</span>
            </div>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full capitalize">
            {campaign.campaign_type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
          {campaign.title}
        </h3>
        {campaign.business_name && (
          <p className="text-sm text-gray-500 mb-3">by {campaign.business_name}</p>
        )}

        {campaign.brief && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{campaign.brief}</p>
        )}

        {/* Fee / Budget */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-gray-400 block">Budget</span>
            <span className="text-lg font-bold text-gray-900">
              {campaign.fee_per_creator
                ? formatCurrency(campaign.fee_per_creator)
                : campaign.total_budget
                ? formatCurrency(campaign.total_budget)
                : 'Variable'}
            </span>
            {campaign.fee_per_creator && (
              <span className="text-xs text-gray-400 ml-1">/ creator</span>
            )}
          </div>

          {campaign.commission_on_top && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              + {campaign.commission_rate}% commission
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          {campaign.max_creators && (
            <span>{campaign.max_creators} spots</span>
          )}
          {campaign.application_deadline && (
            <span>Due: {new Date(campaign.application_deadline).toLocaleDateString()}</span>
          )}
        </div>

        {/* Action */}
        {isLocked ? (
          <Link
            href="/subscriptions"
            className="block w-full text-center bg-purple-50 text-purple-700 py-2.5 rounded-lg font-semibold hover:bg-purple-100 transition text-sm"
          >
            Upgrade to Apply
          </Link>
        ) : (
          <Link
            href={`/campaigns/${campaign.id}`}
            className="block w-full text-center bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
          >
            View Campaign
          </Link>
        )}
      </div>
    </div>
  );
}

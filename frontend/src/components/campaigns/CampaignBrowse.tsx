/**
 * Campaign Browse Page Component
 * Creator view for discovering and browsing available campaigns
 */

'use client';

import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import { creatorCampaignApi } from '@/services/campaignService';
import type { Campaign } from '@/types';

interface CampaignBrowseProps {
  token: string;
}

export default function CampaignBrowse({ token }: CampaignBrowseProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await creatorCampaignApi.browse(token, {
        page,
        search: search || undefined,
        campaign_type: typeFilter || undefined,
      });
      setCampaigns((res.data as any).campaigns || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  const campaignTypes = [
    { value: '', label: 'All Types' },
    { value: 'fixed_fee', label: 'Fixed Fee' },
    { value: 'fee_plus_commission', label: 'Fee + Commission' },
    { value: 'gifted', label: 'Gifted' },
    { value: 'open', label: 'Open' },
    { value: 'invite_only', label: 'Invite Only' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Campaigns</h1>
        <p className="text-gray-500 mt-1">Find paid collaboration opportunities from top brands</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </form>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          {campaignTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-[380px]" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600">No campaigns found</h3>
          <p className="text-gray-400 mt-1">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              locked={!campaign.can_view}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {campaigns.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={campaigns.length < 20}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

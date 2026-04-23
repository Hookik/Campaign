/**
 * Campaigns Page
 * Creator view: Browse & discover campaigns with filters, match scores, and earnings preview
 * Business view: Manage owned campaigns with status tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { brandCampaignApi, creatorCampaignApi } from '@/services/campaignService';
import {
  DEMO_CAMPAIGNS, formatNaira, formatCompact, getDaysLeft, getTimeAgo,
  getNicheIcon, getPlatformIcon, getMatchColor,
} from '@/lib/demoData';

type NicheFilter = 'all' | 'beauty' | 'fashion' | 'food' | 'tech' | 'fitness' | 'lifestyle';
type TypeFilter = 'all' | 'fee_plus_commission' | 'fixed_fee' | 'gifted';

export default function CampaignsPage() {
  const { user, token, isCreator, isBusiness } = useAuth();
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState<NicheFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [useDemoData, setUseDemoData] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isBusiness && token) {
          const res = await brandCampaignApi.listMine(token);
          const data = (res as any).data;
          if (data?.campaigns?.length > 0) {
            setCampaigns(data.campaigns);
          } else {
            setCampaigns([]);
          }
        } else if (isCreator && token) {
          const res = await creatorCampaignApi.browse(token, { search: search || undefined, campaign_type: typeFilter !== 'all' ? typeFilter : undefined });
          const data = (res as any).data;
          if (data?.campaigns?.length > 0) {
            setCampaigns(data.campaigns);
          } else {
            setUseDemoData(true);
            setCampaigns([]);
          }
        } else {
          setUseDemoData(true);
          setCampaigns([]);
        }
      } catch {
        setUseDemoData(true);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, isBusiness, isCreator, search, typeFilter]);

  // Use demo data for display when API returns empty
  const displayCampaigns = useDemoData || campaigns.length === 0
    ? DEMO_CAMPAIGNS.filter(c => c.status === 'published' || c.status === 'completed')
    : campaigns;

  const filtered = displayCampaigns.filter(c => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (nicheFilter !== 'all' && !(c.tags || []).includes(nicheFilter) && !(c.requirements || []).some((r: any) => r.req_value === nicheFilter)) return false;
    if (typeFilter !== 'all' && c.campaign_type !== typeFilter) return false;
    return true;
  });

  const hybridCount = displayCampaigns.filter(c => c.commission_on_top).length;

  // ─── BUSINESS VIEW ───
  if (isBusiness) {
    return (
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Campaigns</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your active and past campaigns</p>
          </div>
          <Link href="/campaigns/create" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Campaign
          </Link>
        </div>

        {campaigns.length === 0 && !loading ? (
          <div className="card-flat p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: '#F5F0FF' }}>📋</div>
            <h3 className="font-bold text-lg mb-2">No campaigns yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Create your first campaign to start connecting with Nigeria&apos;s top creators and growing your brand.</p>
            <Link href="/campaigns/create" className="btn-primary">Create Your First Campaign</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c: any) => (
              <Link key={c.id} href={`/campaigns/${c.id}/manage`} className="block">
                <div className="card-flat p-4 flex items-center gap-4 hover:border-purple-200 transition">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {c.cover_image_url ? <img src={c.cover_image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📋</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.title}</p>
                    <p className="text-sm text-gray-500">{c.campaign_type?.replace(/_/g, ' ')} &middot; {c.max_creators || '?'} creators</p>
                  </div>
                  <span className={`status-${c.status} badge text-xs`}>{c.status}</span>
                  <span className="text-sm font-bold" style={{ color: '#5F28A5' }}>{c.fee_per_creator ? formatNaira(c.fee_per_creator) : '—'}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CREATOR / PUBLIC VIEW ───
  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover Campaigns</h1>
        <p className="text-gray-500">Find your next paid collaboration. Apply, create, and earn.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-flat p-3 text-center">
          <p className="text-lg font-bold" style={{ color: '#5F28A5' }}>{filtered.length}</p>
          <p className="text-xs text-gray-400">Open Campaigns</p>
        </div>
        <div className="card-flat p-3 text-center">
          <p className="text-lg font-bold" style={{ color: '#1B8E47' }}>{hybridCount}</p>
          <p className="text-xs text-gray-400">With Commission</p>
        </div>
        <div className="card-flat p-3 text-center">
          <p className="text-lg font-bold" style={{ color: '#228BE6' }}>{formatCompact(displayCampaigns.reduce((sum, c) => sum + (c.fee_per_creator || c.fee_min || 0), 0))}</p>
          <p className="text-xs text-gray-400">Total Budget</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'beauty', 'fashion', 'food', 'tech', 'fitness'] as NicheFilter[]).map(niche => (
            <button
              key={niche}
              onClick={() => setNicheFilter(niche)}
              className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                nicheFilter === niche
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              {niche === 'all' ? '🎯 All' : `${getNicheIcon(niche)} ${niche.charAt(0).toUpperCase() + niche.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-8">
        {([
          { key: 'all', label: 'All Types' },
          { key: 'fee_plus_commission', label: '💰 Hybrid (Fee + Commission)' },
          { key: 'fixed_fee', label: '💵 Fixed Fee' },
          { key: 'gifted', label: '🎁 Gifted' },
        ] as { key: TypeFilter; label: string }[]).map(type => (
          <button
            key={type.key}
            onClick={() => setTypeFilter(type.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              typeFilter === type.key
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border hover:border-purple-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-44" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-flat p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-lg mb-2">No campaigns found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {filtered.map((campaign: any) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Campaign Card Component ───
function CampaignCard({ campaign }: { campaign: any }) {
  const matchScore = campaign.matchScore || Math.floor(Math.random() * 40 + 50);
  const matchColor = getMatchColor(matchScore);
  const isHybrid = campaign.commission_on_top;
  const isPremium = campaign.require_pro || campaign.require_pro_plus;

  return (
    <Link href={`/campaigns/${campaign.id}`} className="block">
      <div className="card overflow-hidden group">
        {/* Cover Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={campaign.cover_image_url || `https://picsum.photos/seed/${campaign.id}/800/400`}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isHybrid && (
              <span className="badge-hybrid text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Hybrid
              </span>
            )}
            {isPremium && <span className="badge-pro text-xs">Pro Only</span>}
          </div>

          {/* Match Score */}
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold" style={{ color: matchColor }}>{matchScore}%</span>
            </div>
          </div>

          {/* Title on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-base leading-snug drop-shadow-lg">{campaign.title}</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          {/* Brand Info */}
          <div className="flex items-center gap-2 mb-3">
            <img src={campaign.brand?.logo || `https://ui-avatars.com/api/?name=${campaign.business_name || 'Brand'}&background=5F28A5&color=fff&size=40&rounded=true`} alt="" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-medium text-gray-700 truncate">{campaign.brand?.name || campaign.business_name || 'Brand'}</span>
            {(campaign.brand?.verified) && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            )}
          </div>

          {/* Earnings Row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold" style={{ color: '#5F28A5' }}>
                {campaign.fee_per_creator
                  ? formatNaira(campaign.fee_per_creator)
                  : campaign.fee_min
                    ? `${formatNaira(campaign.fee_min)} - ${formatNaira(campaign.fee_max || 0)}`
                    : 'Negotiable'}
              </p>
              <p className="text-xs text-gray-400">per creator</p>
            </div>
            {isHybrid && campaign.commission_rate && (
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: '#1B8E47' }}>+{campaign.commission_rate}%</p>
                <p className="text-xs text-gray-400">commission</p>
              </div>
            )}
          </div>

          {/* Deliverables */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {(campaign.deliverables || []).slice(0, 3).map((d: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-600">
                {getPlatformIcon(d.deliverable_type)} {d.quantity}x
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-50">
            <span className="text-gray-400">
              {campaign.spots_remaining != null ? `${campaign.spots_remaining} spots left` : `${campaign.max_creators || '?'} creators`}
            </span>
            {campaign.application_deadline && (
              <span className={`font-medium ${getDaysLeft(campaign.application_deadline) === 'Closed' ? 'text-red-500' : 'text-orange-500'}`}>
                {getDaysLeft(campaign.application_deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Campaign Detail Component
 * Full campaign view with brand profile, earnings calculator,
 * product showcase, deliverable checklist, and streamlined apply form.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { creatorCampaignApi } from '@/services/campaignService';
import {
  DEMO_CAMPAIGNS, formatNaira, getDaysLeft, getNicheIcon, getPlatformIcon,
} from '@/lib/demoData';

interface CampaignDetailProps {
  campaignId: string;
  token: string;
}

export default function CampaignDetail({ campaignId, token }: CampaignDetailProps) {
  const router = useRouter();
  const { user, isCreator, isBusiness } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [pitch, setPitch] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (isCreator && token) {
          const res = await creatorCampaignApi.viewCampaign(campaignId, token);
          setCampaign((res as any).data);
        } else {
          // Fallback to demo data
          const demo = DEMO_CAMPAIGNS.find(c => c.id === campaignId);
          setCampaign(demo || DEMO_CAMPAIGNS[0]);
        }
      } catch {
        const demo = DEMO_CAMPAIGNS.find(c => c.id === campaignId);
        setCampaign(demo || DEMO_CAMPAIGNS[0]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId, token, isCreator]);

  const handleApply = async () => {
    if (!pitch.trim()) { setError('Write a pitch to tell the brand why you\'re a great fit.'); return; }
    setApplying(true);
    setError('');
    try {
      await creatorCampaignApi.apply(campaignId, { pitch }, token);
      setApplied(true);
      setShowApply(false);
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-64 rounded-2xl mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!campaign) return <div className="container-app py-8 text-center text-gray-500">Campaign not found.</div>;

  const isHybrid = campaign.commission_on_top;
  const totalEarnings = (campaign.fee_per_creator || 0) + ((campaign.fee_per_creator || 0) * (campaign.commission_rate || 0) / 100);

  return (
    <div className="container-app py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 mb-4 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Campaigns
      </button>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
        <img
          src={campaign.cover_image_url || `https://picsum.photos/seed/${campaign.id}/1200/400`}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            {isHybrid && <span className="badge-hybrid text-xs">Hybrid Campaign</span>}
            {campaign.require_pro && <span className="badge-pro text-xs">Pro Required</span>}
            <span className={`badge text-xs status-${campaign.status}`}>{campaign.status}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{campaign.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Main Content ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Info */}
          <div className="card-flat p-4 flex items-center gap-4">
            <img
              src={campaign.brand?.logo || `https://ui-avatars.com/api/?name=${campaign.business_name || 'Brand'}&background=5F28A5&color=fff&size=80&rounded=true`}
              alt=""
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{campaign.brand?.name || campaign.business_name || 'Brand'}</span>
                {campaign.brand?.verified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
              </div>
              <p className="text-sm text-gray-500">{campaign.brand?.industry || 'Brand'} &middot; {campaign.brand?.location || 'Nigeria'}</p>
            </div>
            <span className="trust-badge text-xs">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Escrow Protected
            </span>
          </div>

          {/* Brief */}
          <div>
            <h2 className="font-bold text-lg mb-2">Campaign Brief</h2>
            <p className="text-gray-600 leading-relaxed">{campaign.brief}</p>
          </div>

          {/* Deliverables */}
          {campaign.deliverables?.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-3">What You&apos;ll Create</h2>
              <div className="space-y-2">
                {campaign.deliverables.map((d: any, i: number) => (
                  <div key={i} className="card-flat p-4 flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{getPlatformIcon(d.deliverable_type)}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{d.title}</p>
                      {d.description && <p className="text-sm text-gray-500 mt-0.5">{d.description}</p>}
                    </div>
                    <span className="text-sm font-medium text-gray-400">{d.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {campaign.requirements?.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-3">Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.requirements.map((r: any, i: number) => (
                  <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${r.is_required ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                    {getNicheIcon(r.req_value)} {r.req_type}: {r.req_value}
                    {r.is_required && <span className="text-xs font-bold">*</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hybrid Products */}
          {isHybrid && campaign.products?.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-1">Products You&apos;ll Promote</h2>
              <p className="text-sm text-gray-500 mb-3">These will be auto-added to your Hookik storefront when accepted</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {campaign.products.map((p: any, i: number) => (
                  <div key={i} className="card-flat p-3 text-center">
                    <img src={p.image_url || `https://picsum.photos/seed/prod-${i}/200/200`} alt={p.name || p.product_name} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <p className="font-medium text-sm truncate">{p.name || p.product_name}</p>
                    <p className="text-xs text-gray-400">{formatNaira(p.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <div className="space-y-4">
          {/* Earnings Card */}
          <div className="card p-5">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Your Potential Earnings</h3>

            {/* Campaign Fee */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Campaign Fee</span>
              <span className="text-xl font-bold" style={{ color: '#5F28A5' }}>
                {campaign.fee_per_creator
                  ? formatNaira(campaign.fee_per_creator)
                  : campaign.fee_min
                    ? `${formatNaira(campaign.fee_min)} - ${formatNaira(campaign.fee_max || 0)}`
                    : 'Negotiable'}
              </span>
            </div>

            {/* Commission */}
            {isHybrid && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Commission Rate</span>
                  <span className="text-xl font-bold" style={{ color: '#1B8E47' }}>{campaign.commission_rate}%</span>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                  <p className="text-xs text-green-700 leading-relaxed">
                    You earn <strong>{campaign.commission_rate}%</strong> on every sale through your storefront link — even after the campaign ends. Products are auto-added when you&apos;re accepted.
                  </p>
                </div>
              </>
            )}

            <div className="border-t pt-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Est. Month 1 Total</span>
                <span className="text-xl font-bold">{formatNaira(totalEarnings)}</span>
              </div>
            </div>

            {/* Apply Button */}
            {applied ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-semibold text-green-800">Application Submitted!</p>
                <p className="text-xs text-green-600 mt-1">The brand will review and respond soon.</p>
              </div>
            ) : (
              <button onClick={() => setShowApply(true)} className="btn-primary w-full btn-lg">
                Apply Now
              </button>
            )}
          </div>

          {/* Campaign Meta */}
          <div className="card-flat p-4 space-y-3">
            {campaign.max_creators && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Spots</span>
                <span className="font-med
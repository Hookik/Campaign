/**
 * Campaign Detail Component
 * Full campaign view with apply functionality (creator side)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/shared/StatusBadge';
import { creatorCampaignApi } from '@/services/campaignService';
import type { Campaign } from '@/types';

interface CampaignDetailProps {
  campaignId: string;
  token: string;
}

export default function CampaignDetail({ campaignId, token }: CampaignDetailProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await creatorCampaignApi.viewCampaign(campaignId, token);
        setCampaign(res.data as unknown as Campaign);
      } catch (err: any) {
        if (err.data?.error === 'ENTITLEMENT_DENIED') {
          setCampaign(err.data.data);
        } else {
          setError('Campaign not found');
        }
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [campaignId, token]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      await creatorCampaignApi.apply(campaignId, {
        pitch,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined,
      }, token);
      router.push('/campaigns?tab=applications');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-64 bg-gray-100 rounded-xl" />
      <div className="h-8 bg-gray-100 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-32 bg-gray-100 rounded" />
    </div>;
  }

  if (!campaign) {
    return <div className="text-center py-16">
      <h2 className="text-xl font-bold text-gray-600">Campaign not found</h2>
    </div>;
  }

  const isLocked = campaign.locked;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover */}
      <div className="h-64 rounded-xl overflow-hidden relative mb-8" style={{ background: 'linear-gradient(135deg, #5F28A5, #8937CE)' }}>
        {campaign.cover_image_url && (
          <img src={campaign.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <StatusBadge status={campaign.status} size="md" />
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
        {campaign.business_name && (
          <p className="text-lg text-gray-500 mt-1">by {campaign.business_name}</p>
        )}
      </div>

      {isLocked ? (
        /* Locked state */
        <div className="border rounded-xl p-8 text-center" style={{ backgroundColor: '#F2F5FF', borderColor: '#D4C4F0' }}>
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: '#5F28A5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#5F28A5' }}>Premium Campaign</h2>
          <p className="text-gray-600 mb-6">Upgrade your plan to view the full details and apply to this campaign.</p>
          <a href="/subscriptions" className="inline-block text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition" style={{ backgroundColor: '#5F28A5' }}>
            Upgrade Now
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brief */}
            {campaign.brief && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Campaign Brief</h2>
                <div className="prose max-w-none text-gray-600">{campaign.brief}</div>
              </section>
            )}

            {/* Deliverables */}
            {campaign.deliverables && campaign.deliverables.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Deliverables</h2>
                <div className="space-y-3">
                  {campaign.deliverables.map((del) => (
                    <div key={del.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: '#F2F5FF', color: '#5F28A5' }}>
                        {del.quantity}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{del.title}</p>
                        {del.description && <p className="text-sm text-gray-500">{del.description}</p>}
                        {del.deliverable_type && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block capitalize">
                            {del.deliverable_type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {campaign.requirements && campaign.requirements.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
                <div className="flex flex-wrap gap-2">
                  {campaign.requirements.map((req) => (
                    <span key={req.id} className={`px-3 py-1.5 rounded-full text-sm font-medium ${req.is_required ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {req.req_type}: {req.req_value} {req.is_required && '*'}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Apply Form */}
            {showApplyForm && campaign.can_apply && (
              <section className="bg-white border rounded-xl p-6" style={{ borderColor: '#D4C4F0' }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Apply to This Campaign</h2>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Pitch <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      rows={5}
                      placeholder="Tell the brand why you're the right creator for this campaign..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      required
                      minLength={10}
                    />
                  </div>

                  {campaign.allow_negotiation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Rate (optional)</label>
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder="Your proposed fee in NGN"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      />
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={applying}
                      className="text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                      style={{ backgroundColor: '#5F28A5' }}
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign info card */}
            <div className="bg-white border rounded-xl p-6 space-y-4 sticky top-4">
              <div>
                <span className="text-xs text-gray-400">Campaign Type</span>
                <p className="font-semibold text-gray-900 capitalize">{campaign.campaign_type.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <span className="text-xs text-gray-400">Budget</span>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(campaign.fee_per_creator || campaign.total_budget)}
                </p>
                {campaign.fee_per_creator && <span className="text-xs text-gray-400">per creator</span>}
              </div>

              {campaign.commission_on_top && (
                <div className="bg-green-50 rounded-lg p-3">
                  <span className="text-xs text-green-600 font-medium">+ {campaign.commission_rate}% affiliate commission</span>
                </div>
              )}

              {campaign.application_deadline && (
                <div>
                  <span className="text-xs text-gray-400">Apply By</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(campaign.application_deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}

              {campaign.max_creators && (
                <div>
                  <span className="text-xs text-gray-400">Spots Available</span>
                  <p className="font-semibold text-gray-900">{campaign.max_creators} creators</p>
                </div>
              )}

              {/* Apply button */}
              {campaign.can_apply ? (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="w-full text-white py-3 rounded-lg font-bold hover:opacity-90 transition"
                  style={{ backgroundColor: '#5F28A5' }}
                >
                  Apply Now
                </button>
              ) : campaign.apply_reason === 'plan_required' ? (
                <a
                  href="/subscriptions"
                  className="block w-full text-center py-3 rounded-lg font-semibold hover:opacity-90 transition"
                  style={{ backgroundColor: '#F2F5FF', color: '#5F28A5' }}
                >
                  Upgrade to Apply
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

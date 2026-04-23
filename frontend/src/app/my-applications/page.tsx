/**
 * My Applications Page (Creator)
 * Shows all campaign applications with status tracking,
 * deliverable submission for accepted campaigns, and payout status.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { creatorCampaignApi } from '@/services/campaignService';
import { formatNaira, getTimeAgo, getPlatformIcon } from '@/lib/demoData';

type StatusFilter = 'all' | 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export default function MyApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitText, setSubmitText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadApplications();
  }, [token]);

  async function loadApplications() {
    try {
      const res = await creatorCampaignApi.myApplications(token!);
      setApplications((res as any).data?.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(appId: string) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await creatorCampaignApi.withdraw(appId, token!);
      await loadApplications();
    } catch (err: any) {
      alert(err.data?.error || err.message || 'Withdraw failed');
    }
  }

  async function handleSubmitDeliverable(appId: string, deliverableId: string) {
    if (!submitUrl.trim() && !submitText.trim()) {
      alert('Please add a content URL or description.');
      return;
    }
    setSubmitting(true);
    try {
      await creatorCampaignApi.submitDeliverable(appId, deliverableId, {
        content_url: submitUrl || undefined,
        content_text: submitText || undefined,
      }, token!);
      setSubmitUrl('');
      setSubmitText('');
      await loadApplications();
      alert('Deliverable submitted! The brand will review it.');
    } catch (err: any) {
      alert(err.data?.error || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-gray-500">Track your campaign applications and deliver content</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
        {([
          { key: 'applied', label: 'Pending', color: '#228BE6', bg: '#D0EBFF', icon: '⏳' },
          { key: 'shortlisted', label: 'Shortlisted', color: '#E8590C', bg: '#FFF4E6', icon: '⭐' },
          { key: 'accepted', label: 'Accepted', color: '#1B8E47', bg: '#F0FDF4', icon: '✅' },
          { key: 'rejected', label: 'Rejected', color: '#E03131', bg: '#FFE3E3', icon: '❌' },
          { key: 'withdrawn', label: 'Withdrawn', color: '#6B7280', bg: '#F3F4F6', icon: '↩️' },
        ] as { key: StatusFilter; label: string; color: string; bg: string; icon: string }[]).map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className={`card p-3 text-center transition ${filter === s.key ? 'ring-2' : ''}`}
            style={filter === s.key ? { ringColor: s.color } : {}}
          >
            <span className="text-lg block mb-1">{s.icon}</span>
            <p className="text-lg font-bold" style={{ color: s.color }}>{statusCounts[s.key]}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-flat p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-lg mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {filter === 'all' ? 'Browse campaigns and apply to start earning.' : 'Try a different filter.'}
          </p>
          {filter === 'all' && <Link href="/campaigns" className="btn-primary">Browse Campaigns</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app.id} className="card-flat overflow-hidden">
              {/* Application Header */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/campaigns/${app.campaign_id}`} className="font-semibold hover:text-purple-600 transition truncate">
                        {app.campaign_title || 'Campaign'}
                      </Link>
                      <span className={`badge text-xs status-${app.status}`}>{app.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{app.campaign_type?.replace(/_/g, ' ')} &middot; {app.business_name || 'Brand'}</p>

                    {/* Earnings Info */}
                    <div className="flex items-center gap-4">
                      {app.fee_per_creator && (
                        <span className="text-sm font-bold" style={{ color: '#5F28A5' }}>{formatNaira(app.fee_per_creator)}</span>
                      )}
                      {app.commission_rate && (
                        <span className="text-sm font-bold" style={{ color: '#1B8E47' }}>+{app.commission_rate}% commission</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {app.status === 'applied' && (
                      <button onClick={() => handleWithdraw(app.id)} className="text-xs text-red-500 hover:text-red-700">
                        Withdraw
                      </button>
                    )}
                    {app.status === 'accepted' && (
                      <button
                        onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                        className="btn-green btn-sm text-xs"
                      >
                        {expandedApp === app.id ? 'Hide Deliverables' : 'Submit Content'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Brand Notes */}
                {app.brand_notes && (
                  <div className="mt-3 bg-purple-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-700 mb-1">Brand&apos;s Note:</p>
                    <p className="text-sm text-purple-600">{app.brand_notes}</p>
                  </div>
                )}

                {/* Applied date */}
                <p className="text-xs text-gray-400 mt-2">Applied {getTimeAgo(app.created_at || new Date().toISOString())}</p>
              </div>

              {/* Deliverable Submission (Expanded for accepted) */}
              {expandedApp === app.id && app.status === 'accepted' && (
                <div className="border-t bg-gray-50 p-5">
                  <h4 className="font-bold text-sm mb-3">Submit Deliverables</h4>
                  <p className="text-xs text-gray-500 mb-4">Upload your content for the brand to review. You can submit a URL (Instagram, TikTok, YouTube) or describe the content.</p>

                  {/* List campaign deliverables */}
                  {app.deliverables?.map((del: any) => (
                    <div key={del.id} className="card bg-white p-4 mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getPlatformIcon(del.deliverable_type)}</span>
                        <div>
                          <p className="font-medium text-sm">{del.title}</p>
                          <p className="text-xs text-gray-400">{del.quantity}x {del.deliverable_type?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="Content URL (Instagram, TikTok, YouTube...)"
                          value={submitUrl}
                          onChange={e => setSubmitUrl(e.target.value)}
                          className="input text-sm"
                        />
                        <textarea
                          placeholder="Description or notes (optional)"
                          value={submitText}
                          onChange={e => setSubmitText(e.target.value)}
                          rows={2}
                          className="input text-sm"
                        />
                        <button
                          onClick={() => handleSubmitDeliverable(app.id, del.id)}
                          disabled={submitting}
                          className="btn-primary btn-sm text-xs"
                        >
                          {submitting ? 'Submitting...' : 'Submit Deliverable'}
                        </button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No deliverables defined for this campaign. Contact the brand for instructions.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

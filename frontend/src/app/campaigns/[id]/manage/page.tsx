/**
 * Campaign Management Hub
 * Brand's workspace for managing a live campaign:
 * - Overview: campaign stats and status
 * - Applications: review, accept, reject, shortlist creators
 * - Submissions: review delivered content
 * - Payouts: manage creator payments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { brandCampaignApi } from '@/services/campaignService';
import { formatNaira, getNicheIcon, getPlatformIcon, getTimeAgo, formatFollowers } from '@/lib/demoData';

type Tab = 'overview' | 'applications' | 'submissions' | 'payouts';

export default function CampaignManagePage() {
  const params = useParams();
  const router = useRouter();
  const { token, isBusiness } = useAuth();
  const campaignId = params.id as string;

  const [tab, setTab] = useState<Tab>('overview');
  const [campaign, setCampaign] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load campaign data
  useEffect(() => {
    if (!token) return;
    loadCampaign();
    loadApplications();
  }, [token, campaignId]);

  async function loadCampaign() {
    try {
      const res = await brandCampaignApi.getById(campaignId, token!);
      setCampaign((res as any).data);
    } catch (err) {
      console.error('Failed to load campaign:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const res = await brandCampaignApi.listApplications(campaignId, token!);
      setApplications((res as any).data?.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }

  async function loadPayouts() {
    try {
      const res = await brandCampaignApi.listPayouts(campaignId, token!);
      setPayouts((res as any).data || []);
    } catch (err) {
      console.error('Failed to load payouts:', err);
    }
  }

  async function loadSubmissions(appId: string) {
    try {
      const res = await brandCampaignApi.getSubmissions(appId, token!);
      setSubmissions((res as any).data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  }

  async function handleApplicationAction(appId: string, status: string, notes?: string) {
    setActionLoading(appId);
    try {
      await brandCampaignApi.updateApplicationStatus(appId, status, token!, notes);
      await loadApplications();
    } catch (err: any) {
      alert(err.data?.error || err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReviewSubmission(submissionId: string, action: string, feedback: string) {
    setActionLoading(submissionId);
    try {
      await brandCampaignApi.reviewSubmission(submissionId, action, feedback, token!);
      // Reload submissions for current application
      const acceptedApp = applications.find(a => a.status === 'accepted');
      if (acceptedApp) await loadSubmissions(acceptedApp.id);
    } catch (err: any) {
      alert(err.data?.error || err.message || 'Review failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTransition(newStatus: string) {
    setActionLoading('transition');
    try {
      await brandCampaignApi.transition(campaignId, newStatus, token!);
      await loadCampaign();
    } catch (err: any) {
      alert(err.data?.error || err.message || 'Transition failed');
    } finally {
      setActionLoading(null);
    }
  }

  // Derived data
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const isHybrid = campaign?.commission_on_top;

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-4 w-48 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container-app py-16 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="font-bold text-xl mb-2">Campaign not found</h2>
        <p className="text-gray-500 mb-6">This campaign doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/campaigns" className="btn-primary">Back to Campaigns</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: 'Applications', count: appliedCount },
    { key: 'submissions', label: 'Submissions', count: submissions.length },
    { key: 'payouts', label: 'Payouts' },
  ];

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => router.push('/campaigns')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 mb-2 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            My Campaigns
          </button>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge text-xs status-${campaign.status}`}>{campaign.status}</span>
            {isHybrid && <span className="badge-hybrid text-xs">Hybrid</span>}
            <span className="text-sm text-gray-400">{campaign.campaign_type?.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'draft' && (
            <button onClick={() => handleTransition('published')} disabled={actionLoading === 'transition'} className="btn-primary btn-sm">
              {actionLoading === 'transition' ? 'Publishing...' : 'Publish Campaign'}
            </button>
          )}
          {campaign.status === 'published' && (
            <button onClick={() => handleTransition('accepting')} disabled={actionLoading === 'transition'} className="btn-green btn-sm">
              Start Accepting
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === 'payouts') loadPayouts();
            }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📋" label="Applications" value={applications.length.toString()} color="#5F28A5" bg="#F5F0FF" />
            <StatCard icon="✅" label="Accepted" value={acceptedCount.toString()} color="#1B8E47" bg="#F0FDF4" />
            <StatCard icon="⭐" label="Shortlisted" value={shortlistedCount.toString()} color="#E8590C" bg="#FFF4E6" />
            <StatCard icon="💰" label="Budget" value={campaign.fee_per_creator ? formatNaira(campaign.fee_per_creator) : '—'} color="#228BE6" bg="#D0EBFF" />
          </div>

          {/* Campaign Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card-flat p-5">
              <h3 className="font-bold mb-3">Campaign Brief</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{campaign.brief}</p>
            </div>
            <div className="card-flat p-5">
              <h3 className="font-bold mb-3">Campaign Details</h3>
              <div className="space-y-2">
                <DetailRow label="Fee per Creator" value={campaign.fee_per_creator ? formatNaira(campaign.fee_per_creator) : '—'} />
                {isHybrid && <DetailRow label="Commission Rate" value={`${campaign.commission_rate}%`} />}
                <DetailRow label="Max Creators" value={campaign.max_creators || '—'} />
                <DetailRow label="Visibility" value={campaign.visibility} />
                <DetailRow label="Type" value={campaign.campaign_type?.replace(/_/g, ' ')} />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {campaign.deliverables?.length > 0 && (
            <div className="card-flat p-5">
              <h3 className="font-bold mb-3">Deliverables</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {campaign.deliverables.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{getPlatformIcon(d.deliverable_type)}</span>
                    <div>
                      <p className="font-medium text-sm">{d.title}</p>
                      <p className="text-xs text-gray-400">{d.quantity}x &middot; {d.deliverable_type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products (Hybrid) */}
          {isHybrid && campaign.products?.length > 0 && (
            <div className="card-flat p-5">
              <h3 className="font-bold mb-3">Linked Products ({campaign.products.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {campaign.products.map((p: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="w-full h-20 rounded-lg bg-gray-100 mb-2 overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <p className="text-xs font-medium truncate">{p.product_name || p.name}</p>
                    <p className="text-xs text-gray-400">{p.price ? formatNaira(p.price) : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── APPLICATIONS TAB ─── */}
      {tab === 'applications' && (
        <div>
          {/* Status Filters */}
          <div className="flex gap-2 mb-4">
            {['all', 'applied', 'shortlisted', 'accepted', 'rejected'].map(status => {
              const count = status === 'all' ? applications.length : applications.filter(a => a.status === status).length;
              return (
                <button key={status} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border hover:border-purple-200 transition capitalize">
                  {status} ({count})
                </button>
              );
            })}
          </div>

          {applications.length === 0 ? (
            <div className="card-flat p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="font-bold text-lg mb-2">No applications yet</h3>
              <p className="text-gray-500 text-sm">Once creators apply, they&apos;ll appear here for your review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="card-flat p-5">
                  <div className="flex items-start gap-4">
                    {/* Creator Avatar */}
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.creator_name || app.display_name || 'Creator')}&background=random&color=fff&size=80`}
                      alt=""
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />

                    {/* Creator Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{app.creator_name || app.display_name || 'Creator'}</span>
                        {app.handle && <span className="text-sm text-gray-400">@{app.handle}</span>}
                        <span className={`badge text-xs status-${app.status}`}>{app.status}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        {app.follower_count && <span>{formatFollowers(app.follower_count)} followers</span>}
                        {app.niche && <span>{getNicheIcon(app.niche)} {app.niche}</span>}
                        {app.subscription_tier && app.subscription_tier !== 'free' && (
                          <span className={app.subscription_tier === 'pro_plus' ? 'badge-pro-plus text-[10px]' : 'badge-pro text-[10px]'}>
                            {app.subscription_tier === 'pro_plus' ? 'Pro+' : 'Pro'}
                          </span>
                        )}
                      </div>

                      {/* Pitch */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{app.pitch || 'No pitch provided'}</p>
                      </div>

                      {/* Proposed Rate */}
                      {app.proposed_rate && (
                        <p className="text-sm text-gray-500 mb-3">
                          Proposed rate: <strong style={{ color: '#5F28A5' }}>{formatNaira(app.proposed_rate)}</strong>
                        </p>
                      )}

                      {/* Applied date */}
                      <p className="text-xs text-gray-400">Applied {getTimeAgo(app.created_at || new Date().toISOString())}</p>
                    </div>

                    {/* Actions */}
                    {app.status === 'applied' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApplicationAction(app.id, 'accepted', 'Welcome aboard!')}
                          disabled={actionLoading === app.id}
                          className="btn-green btn-sm text-xs"
                        >
                          {actionLoading === app.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'shortlisted')}
                          disabled={actionLoading === app.id}
                          className="btn-outline btn-sm text-xs"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'rejected', 'Thank you for applying.')}
                          disabled={actionLoading === app.id}
                          className="text-xs text-red-500 hover:text-red-700 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {app.status === 'shortlisted' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApplicationAction(app.id, 'accepted', 'Welcome aboard!')}
                          disabled={actionLoading === app.id}
                          className="btn-green btn-sm text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'rejected')}
                          disabled={actionLoading === app.id}
                          className="text-xs text-red-500 hover:text-red-700 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {app.status === 'accepted' && (
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-green-600 font-medium">Collaborating</span>
                        <button
                          onClick={() => { loadSubmissions(app.id); setTab('submissions'); }}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          View Submissions &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SUBMISSIONS TAB ─── */}
      {tab === 'submissions' && (
        <div>
          {/* Select creator to view submissions */}
          {applications.filter(a => a.status === 'accepted').length > 0 ? (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">Select a creator to view their submissions:</p>
              <div className="flex gap-2 flex-wrap">
                {applications.filter(a => a.status === 'accepted').map(app => (
                  <button
                    key={app.id}
                    onClick={() => loadSubmissions(app.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border hover:border-purple-200 transition"
                  >
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.creator_name || 'Creator')}&background=random&color=fff&size=40`} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-sm font-medium">{app.creator_name || app.display_name || 'Creator'}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-flat p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-bold text-lg mb-2">No accepted creators yet</h3>
              <p className="text-gray-500 text-sm">Accept creators from the Applications tab first. They&apos;ll submit content here.</p>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="space-y-3 mt-4">
              {submissions.map((sub: any) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  onReview={handleReviewSubmission}
                  loading={actionLoading === sub.id}
                />
              ))}
            </div>
          )}

          {submissions.length === 0 && applications.filter(a => a.status === 'accepted').length > 0 && (
            <div className="card-flat p-8 text-center mt-4">
              <p className="text-gray-500 text-sm">No submissions yet from this creator. They&apos;ll appear here once content is delivered.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── PAYOUTS TAB ─── */}
      {tab === 'payouts' && (
        <div>
          {/* Create Payout Section */}
          {applications.filter(a => a.status === 'accepted').length > 0 && (
            <div className="card p-5 mb-6">
              <h3 className="font-bold mb-3">Create Payout</h3>
              <p className="text-sm text-gray-500 mb-4">Pay an accepted creator for their work on this campaign.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {applications.filter(a => a.status === 'accepted').map(app => (
                  <button
                    key={app.id}
                    onClick={async () => {
                      if (!confirm(`Create a ${formatNaira(campaign.fee_per_creator || 0)} payout for ${app.creator_name || 'this creator'}?`)) return;
                      setActionLoading(app.id);
                      try {
                        await brandCampaignApi.createPayout(campaignId, app.id, {
                          creator_id: app.creator_id,
                          payout_type: 'campaign_fee',
                          amount: campaign.fee_per_creator || 0,
                          notes: 'Campaign fee payment',
                        }, token!);
                        await loadPayouts();
                      } catch (err: any) {
                        alert(err.data?.error || err.message || 'Payout failed');
                      } finally {
                        setActionLoading(null);
                      }
                    }}
                    disabled={actionLoading === app.id}
                    className="card-flat p-4 text-left hover:border-green-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.creator_name || 'Creator')}&background=random&color=fff&size=40`} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <p className="font-medium text-sm">{app.creator_name || app.display_name}</p>
                        <p className="text-xs text-gray-400">Pay {formatNaira(campaign.fee_per_creator || 0)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payout History */}
          {payouts.length === 0 ? (
            <div className="card-flat p-12 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-bold text-lg mb-2">No payouts yet</h3>
              <p className="text-gray-500 text-sm">Once you create payouts for accepted creators, they&apos;ll appear here.</p>
            </div>
          ) : (
            <div className="card-flat overflow-hidden">
              <div className="divide-y">
                {payouts.map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${p.payout_type === 'commission' ? 'bg-green-50' : 'bg-purple-50'}`}>
                      {p.payout_type === 'commission' ? '📈' : '💵'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.creator_name || 'Creator'}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.payout_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <p className="font-bold text-sm" style={{ color: '#5F28A5' }}>{formatNaira(p.amount)}</p>
                    <span className={`badge text-xs status-${p.status}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ───

function StatCard({ icon, label, value, color, bg }: { icon: string; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: bg }}>{icon}</span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium capitalize">{String(value)}</span>
    </div>
  );
}

function SubmissionCard({ submission, onReview, loading }: { submission: any; onReview: (id: string, action: string, feedback: string) => void; loading: boolean }) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="card-flat p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">{submission.deliverable_title || 'Deliverable'}</p>
          <p className="text-xs text-gray-400">{getPlatformIcon(submission.deliverable_type)} {submission.deliverable_type?.replace(/_/g, ' ')}</p>
        </div>
        <span className={`badge text-xs status-${submission.status}`}>{submission.status?.replace(/_/g, ' ')}</span>
      </div>

      {/* Content */}
      {submission.content_url && (
        <a href={submission.content_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all mb-2 block">
          {submission.content_url}
        </a>
      )}
      {submission.content_text && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">{submission.content_text}</p>
      )}

      {/* Revision info */}
      {submission.revision_count > 0 && (
        <p className="text-xs text-orange-500 mb-2">Revision #{submission.revision_count}</p>
      )}

      {/* Actions for submitted status */}
      {submission.status === 'submitted' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <button onClick={() => onReview(submission.id, 'approve', '')} disabled={loading} className="btn-green btn-sm text-xs">
            {loading ? '...' : 'Approve'}
          </button>
          <button onClick={() => setShowFeedback(!showFeedback)} className="btn-outline btn-sm text-xs">
            Request Revision
          </button>
          {showFeedback && (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Feedback for creator..."
                className="input text-xs flex-1"
              />
              <button onClick={() => { onReview(submission.id, 'request_revision', feedback); setShowFeedback(false); }} className="btn-outline btn-sm text-xs">
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

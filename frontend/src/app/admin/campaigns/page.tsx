/**
 * Admin Campaigns Page
 * Campaign moderation and oversight
 */

'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { adminApi } from '@/services/subscriptionService';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.all([
        adminApi.listCampaigns(token, { status: statusFilter || undefined }),
        adminApi.campaignStats(token),
      ]);
      setCampaigns((campRes.data as any).campaigns || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleModerate = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to change this campaign to "${status}"?`)) return;
    try {
      await adminApi.moderateCampaign(id, status, 'Admin action', token);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#5F28A5' }}>Campaign Moderation</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.campaigns_by_status?.map((s: any) => (
            <div key={s.status} className="bg-white border rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-sm text-gray-500 capitalize">{s.status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg">
          <option value="">All Statuses</option>
          {['draft', 'published', 'accepting', 'in_progress', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Business</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Applications</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No campaigns found</td></tr>
            ) : campaigns.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.business_name}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{c.campaign_type?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-gray-500">{c.application_count || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status === 'published' && (
                      <button onClick={() => handleModerate(c.id, 'cancelled')} className="text-xs text-red-600 hover:underline">Cancel</button>
                    )}
                    {['completed', 'cancelled', 'expired'].includes(c.status) && (
                      <button onClick={() => handleModerate(c.id, 'archived')} className="text-xs text-gray-500 hover:underline">Archive</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Admin Subscriptions Page
 * Subscriber management, stats, comp grants
 */

'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { adminApi } from '@/services/subscriptionService';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [compForm, setCompForm] = useState({ creator_id: '', plan: 'pro' });
  const [showComp, setShowComp] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, statsRes] = await Promise.all([
        adminApi.listSubscriptions(token),
        adminApi.subscriptionStats(token),
      ]);
      setSubscriptions((subRes.data as any).subscriptions || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComp = async () => {
    try {
      await adminApi.compSubscription(compForm.creator_id, compForm.plan, token);
      setShowComp(false);
      setCompForm({ creator_id: '', plan: 'pro' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#5F28A5' }}>Subscription Management</h1>
        <button onClick={() => setShowComp(!showComp)} className="btn-primary text-sm">
          {showComp ? 'Close' : 'Comp a Creator'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.plan_distribution?.map((p: any) => (
            <div key={p.slug} className="bg-white border rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900">{p.subscriber_count || 0}</p>
              <p className="text-sm text-gray-500">{p.name}</p>
            </div>
          ))}
          <div className="bg-white border rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency((stats.estimated_mrr?.pro_mrr || 0) + (stats.estimated_mrr?.pro_plus_mrr || 0))}
            </p>
            <p className="text-sm text-gray-500">Estimated MRR</p>
          </div>
        </div>
      )}

      {/* Comp form */}
      {showComp && (
        <div className="border rounded-xl p-6 mb-8" style={{ backgroundColor: '#F2F5FF', borderColor: '#D4C4F0' }}>
          <h3 className="font-bold text-gray-900 mb-4">Comp a Creator</h3>
          <div className="flex gap-4">
            <input type="text" value={compForm.creator_id} onChange={e => setCompForm(f => ({ ...f, creator_id: e.target.value }))}
              placeholder="Creator ID" className="flex-1 px-4 py-2 border rounded-lg" />
            <select value={compForm.plan} onChange={e => setCompForm(f => ({ ...f, plan: e.target.value }))} className="px-4 py-2 border rounded-lg">
              <option value="pro">Creator Pro</option>
              <option value="pro_plus">Creator Pro+</option>
            </select>
            <button onClick={handleComp} className="btn-primary text-sm">Grant</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Creator</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No subscriptions</td></tr>
            ) : subscriptions.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.creator_name}</td>
                <td className="px-4 py-3 text-gray-500">{s.creator_email}</td>
                <td className="px-4 py-3 font-semibold capitalize">{s.plan_name}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

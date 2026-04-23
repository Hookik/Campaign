/**
 * Admin Audit Log Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from '@/services/subscriptionService';
import type { AuditEvent } from '@/types';

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const { token } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.auditLog(token || '', {
        entity_type: entityFilter || undefined,
        action: actionFilter || undefined,
        limit,
        offset,
      });
      const data = res.data as any;
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [entityFilter, actionFilter, offset]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#5F28A5' }}>Audit Log</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setOffset(0); }} className="px-4 py-2 border rounded-lg text-sm">
          <option value="">All Entities</option>
          <option value="campaign">Campaigns</option>
          <option value="application">Applications</option>
          <option value="submission">Submissions</option>
          <option value="subscription">Subscriptions</option>
          <option value="payout">Payouts</option>
          <option value="feature_flag">Feature Flags</option>
        </select>
        <input type="text" value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          placeholder="Filter by action..." className="px-4 py-2 border rounded-lg text-sm flex-1" />
      </div>

      {/* Events */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Entity</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-xs">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No events found</td></tr>
            ) : events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(event.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{event.action}</td>
                <td className="px-4 py-3 text-gray-500">
                  {event.entity_type}/{event.entity_id?.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {event.actor_type || 'system'}{event.actor_id ? `/${event.actor_id.slice(0, 8)}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                  {event.new_state ? JSON.stringify(event.new_state).slice(0, 80) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}</span>
        <div className="flex gap-2">
          <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
          <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}

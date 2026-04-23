/**
 * Earnings Dashboard
 * Creator's financial hub — chart visualization, breakdown, payout history
 * Shows the hybrid model value: campaign fees vs affiliate commissions
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { creatorCampaignApi } from '@/services/campaignService';
import {
  DEMO_EARNINGS_CHART, DEMO_PAYOUTS, formatNaira, formatCompact, getTimeAgo,
} from '@/lib/demoData';

export default function EarningsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<'6m' | '3m' | '1m'>('6m');
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate stats from demo data
  const chartData = DEMO_EARNINGS_CHART;
  const totalEarned = chartData.reduce((s, d) => s + d.total, 0);
  const totalFees = chartData.reduce((s, d) => s + d.campaignFees, 0);
  const totalCommissions = chartData.reduce((s, d) => s + d.commissions, 0);
  const pendingAmount = DEMO_PAYOUTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const filteredPayouts = DEMO_PAYOUTS.filter(p => {
    if (payoutFilter === 'all') return true;
    return p.status === payoutFilter;
  });

  // Draw earnings chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const data = chartData;
    const maxVal = Math.max(...data.map(d => d.total)) * 1.15;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = maxVal - (maxVal / 4) * i;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatCompact(val), padding.left - 8, y + 4);
    }

    const barGroupWidth = chartW / data.length;
    const barWidth = Math.min(barGroupWidth * 0.35, 32);
    const gap = 3;

    data.forEach((d, i) => {
      const x = padding.left + barGroupWidth * i + (barGroupWidth - barWidth * 2 - gap) / 2;
      const feeH = (d.campaignFees / maxVal) * chartH;
      const commH = (d.commissions / maxVal) * chartH;

      // Campaign fee bar (purple)
      const grad1 = ctx.createLinearGradient(0, padding.top + chartH - feeH, 0, padding.top + chartH);
      grad1.addColorStop(0, '#8937CE');
      grad1.addColorStop(1, '#5F28A5');
      ctx.fillStyle = grad1;
      roundRect(ctx, x, padding.top + chartH - feeH, barWidth, feeH, 4);

      // Commission bar (green)
      const grad2 = ctx.createLinearGradient(0, padding.top + chartH - commH, 0, padding.top + chartH);
      grad2.addColorStop(0, '#22A756');
      grad2.addColorStop(1, '#1B8E47');
      ctx.fillStyle = grad2;
      roundRect(ctx, x + barWidth + gap, padding.top + chartH - commH, barWidth, commH, 4);

      // X-axis label
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.month, x + barWidth + gap / 2, padding.top + chartH + 24);
    });
  }, [chartData]);

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-gray-500">Track your campaign fees and affiliate commissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard
          label="Total Earned"
          value={formatNaira(totalEarned)}
          subtext="All time"
          color="#1A1D23"
          bg="#F9FAFB"
          icon="💰"
        />
        <StatCard
          label="Campaign Fees"
          value={formatNaira(totalFees)}
          subtext={`${Math.round(totalFees / totalEarned * 100)}% of total`}
          color="#5F28A5"
          bg="#F5F0FF"
          icon="💵"
        />
        <StatCard
          label="Commissions"
          value={formatNaira(totalCommissions)}
          subtext={`${Math.round(totalCommissions / totalEarned * 100)}% of total`}
          color="#1B8E47"
          bg="#F0FDF4"
          icon="📈"
        />
        <StatCard
          label="Pending"
          value={formatNaira(pendingAmount)}
          subtext="Awaiting payout"
          color="#E8590C"
          bg="#FFF4E6"
          icon="⏳"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Chart ─── */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Earnings Over Time</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#5F28A5' }} />
                  <span className="text-xs text-gray-500">Fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#1B8E47' }} />
                  <span className="text-xs text-gray-500">Commission</span>
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: '260px' }} />
          </div>
        </div>

        {/* ─── Earnings Breakdown ─── */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Earnings Split</h3>

            {/* Donut-style breakdown */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#5F28A5" strokeWidth="3"
                    strokeDasharray={`${Math.round(totalFees / totalEarned * 100)}, 100`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">{Math.round(totalFees / totalEarned * 100)}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#5F28A5' }} />
                    <span className="text-sm text-gray-600">Campaign Fees</span>
                  </div>
                  <span className="text-sm font-semibold">{formatNaira(totalFees)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#1B8E47' }} />
                    <span className="text-sm text-gray-600">Commissions</span>
                  </div>
                  <span className="text-sm font-semibold">{formatNaira(totalCommissions)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-xs text-green-700">
                Commission earnings are growing — they&apos;re now <strong>{Math.round(totalCommissions / totalEarned * 100)}%</strong> of your total. Keep sharing your storefront link!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-flat p-4 space-y-2">
            <Link href="/campaigns" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#F5F0FF' }}>🔍</span>
              <span className="text-sm font-medium">Find new campaigns</span>
              <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/subscriptions" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#F0FDF4' }}>⭐</span>
              <span className="text-sm font-medium">Upgrade for higher commissions</span>
              <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Payout History ─── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Payout History</h2>
          <div className="flex gap-2">
            {(['all', 'paid', 'pending'] as const).map(f => (
              <button
                key={f}
                onClick={() => setPayoutFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  payoutFilter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border hover:border-purple-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card-flat overflow-hidden">
          <div className="divide-y">
            {filteredPayouts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No payouts found</div>
            ) : (
              filteredPayouts.map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${p.payout_type === 'commission' ? 'bg-green-50' : 'bg-purple-50'}`}>
                    {p.payout_type === 'commission' ? '📈' : '💵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.campaign_title}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.payout_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: p.payout_type === 'commission' ? '#1B8E47' : '#5F28A5' }}>
                      {formatNaira(p.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.paid_at ? getTimeAgo(p.paid_at) : '—'}
                    </p>
                  </div>
                  <span className={`status-${p.status} badge text-xs`}>{p.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, subtext, color, bg, icon }: { label: string; value: string; subtext: string; color: string; bg: string; icon: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: bg }}>{icon}</span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
    </div>
  );
}

// ─── Rounded rect helper for canvas ───
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { creatorCampaignApi } from "@/services/campaignService";
import type { CampaignPayout, EarningsSummary } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  approved: "#228BE6",
  processing: "#8937CE",
  paid: "#1B8E47",
  failed: "#EF4444",
  reversed: "#EF4444",
};

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function EarningsPage() {
  const [payouts, setPayouts] = useState<CampaignPayout[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("hookik_token") || "" : "";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await creatorCampaignApi.earnings(token, {
        status: statusFilter || undefined,
      });
      const data = res.data as any;
      setPayouts(data.payouts || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#5F28A5" }}>
          Earnings Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Track your campaign income and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Earned"
          value={summary ? formatCurrency(summary.total_earned) : "---"}
          color="#1B8E47"
        />
        <StatCard
          label="Pending Payouts"
          value={summary ? formatCurrency(summary.total_pending) : "---"}
          color="#EAB308"
        />
        <StatCard
          label="Approved (Processing)"
          value={summary ? formatCurrency(summary.total_approved) : "---"}
          color="#5F28A5"
        />
      </div>

      {/* Earnings Over Time Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Over Time</h2>
        <div className="h-48 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#F2F5FF" }}>
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2" style={{ color: "#5F28A5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-sm text-gray-500">Chart visualization available with active earnings data</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payout Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b" style={{ backgroundColor: "#F2F5FF" }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No payouts yet</p>
                  <p className="text-gray-400 text-xs mt-1">Complete campaigns to start earning</p>
                  <Link href="/campaigns" className="btn-primary text-sm mt-4 inline-block">
                    Browse Campaigns
                  </Link>
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.campaign_title || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.payout_type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                      style={{ backgroundColor: STATUS_COLORS[p.status] || "#6B7280" }}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

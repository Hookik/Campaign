"use client";
import Link from "next/link";
import type { Campaign } from "@/types";

export default function LockedPreviewCard({ campaign }: { campaign: Campaign }) {
  const tierLabel = campaign.require_pro_plus ? "Pro+" : "Pro";

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#5F28A5' }}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          {tierLabel} Exclusive Campaign
        </p>
        <p className="text-xs text-gray-500 mb-3 text-center">
          Upgrade to {tierLabel} to view and apply
        </p>
        <Link href="/subscriptions" className="btn-primary text-sm px-6 py-2">
          Upgrade to {tierLabel}
        </Link>
      </div>

      {/* Blurred content behind */}
      <div className="opacity-40">
        <div className="flex items-center gap-2 mb-2">
          <span className={campaign.require_pro_plus ? "badge-pro-plus" : "badge-pro"}>
            {tierLabel} Only
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.brief}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {campaign.fee_per_creator ? `₦${campaign.fee_per_creator.toLocaleString()}` : "Budget TBD"}
          </span>
          <span className="text-gray-400">{campaign.campaign_type}</span>
        </div>
      </div>
    </div>
  );
}

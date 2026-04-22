"use client";
import Link from "next/link";

interface Props {
  current: number;
  limit: number;
  feature: string;
  upgradeTier: string;
  onDismiss?: () => void;
}

export default function ContextualNudge({ current, limit, feature, upgradeTier, onDismiss }: Props) {
  const pct = Math.round((current / limit) * 100);
  const isNearLimit = pct >= 80;

  if (!isNearLimit) return null;

  return (
    <div className="rounded-xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: '#F2F5FF' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5F28A5' }}>
          <span className="text-white text-sm font-bold">{current}/{limit}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {current === limit ? `You've reached your ${feature} limit` : `${limit - current} ${feature} remaining this month`}
          </p>
          <p className="text-xs text-gray-500">
            Upgrade to {upgradeTier} for {upgradeTier === 'Pro' ? '50' : 'unlimited'} per month
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/subscriptions" className="btn-primary text-xs px-4 py-1.5">
          Upgrade
        </Link>
        {onDismiss && (
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

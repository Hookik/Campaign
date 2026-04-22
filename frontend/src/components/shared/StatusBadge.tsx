/**
 * Status Badge Component
 * Renders color-coded status chips for campaigns, applications, payouts
 */

'use client';

import React from 'react';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // Campaign statuses
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  published: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  accepting: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },

  // Application statuses
  applied: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  shortlisted: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },

  // Submission statuses
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  revision_requested: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },

  // Payout statuses
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  reversed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },

  // Subscription
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  trialing: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  past_due: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  comped: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  paused: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize
        ${colors.bg} ${colors.text}
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

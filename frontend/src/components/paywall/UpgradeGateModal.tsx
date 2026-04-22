"use client";
import Link from "next/link";

interface Props {
  feature: string;
  requiredTier: string;
  onClose: () => void;
}

export default function UpgradeGateModal({ feature, requiredTier, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F2F5FF' }}>
            <svg className="w-8 h-8" style={{ color: '#5F28A5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unlock {feature}
          </h3>
          <p className="text-gray-500 mb-6">
            This feature is available on the <span className="font-semibold" style={{ color: '#5F28A5' }}>{requiredTier}</span> plan.
            Upgrade now to access {feature.toLowerCase()} and many more premium features.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/subscriptions" className="btn-primary w-full py-3">
              View Plans & Upgrade
            </Link>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

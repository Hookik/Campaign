/**
 * Admin Feature Flags Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/subscriptionService';
import type { FeatureFlag } from '@/types';

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('hookik_token') || '' : '';

  const fetchFlags = async () => {
    try {
      const res = await adminApi.listFlags(token);
      setFlags(res.data as unknown as FeatureFlag[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    try {
      await adminApi.toggleFlag(key, !currentEnabled, token);
      fetchFlags();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Flags</h1>
      <p className="text-gray-500 mb-8">Control which features are live on the platform</p>

      <div className="bg-white border rounded-xl divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between p-5 hover:bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900">{flag.flag_label || flag.flag_key}</p>
              <p className="text-sm text-gray-400 font-mono">{flag.flag_key}</p>
            </div>
            <button
              onClick={() => handleToggle(flag.flag_key, flag.is_enabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${flag.is_enabled ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${flag.is_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
        Toggling a flag immediately affects all users. Changes are recorded in the audit log.
      </div>
    </div>
  );
}

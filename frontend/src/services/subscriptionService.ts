/**
 * Subscription API Service
 * Frontend service layer for subscription and admin operations
 */

import api from '@/lib/api';
import type {
  ApiResponse, SubscriptionPlan, CreatorSubscription,
  FeatureFlag, AuditEvent
} from '@/types';

// ─── Creator Subscription API ───

export const subscriptionApi = {
  getPlans: () =>
    api.get<ApiResponse<SubscriptionPlan[]>>('/creator/plans'),

  getCurrent: (token: string) =>
    api.get<ApiResponse<CreatorSubscription>>('/creator/subscription', token),

  subscribe: (plan: string, billingCycle: 'monthly' | 'annual', token: string) =>
    api.post<ApiResponse<{ authorization_url: string; reference: string }>>('/creator/subscription', { plan, billing_cycle: billingCycle }, token),

  verify: (reference: string, plan: string, token: string) =>
    api.post<ApiResponse<CreatorSubscription>>('/creator/subscription/verify', { reference, plan }, token),

  cancel: (token: string) =>
    api.delete<ApiResponse<CreatorSubscription>>('/creator/subscription', token),
};

// ─── Admin API ───

export const adminApi = {
  // Subscriptions
  listSubscriptions: (token: string, params?: { status?: string; plan?: string; page?: number }) =>
    api.get<ApiResponse<{ subscriptions: any[]; counts: any[] }>>('/admin/subscriptions', token, params),

  subscriptionStats: (token: string) =>
    api.get<ApiResponse<any>>('/admin/subscriptions/stats', token),

  compSubscription: (creatorId: string, plan: string, token: string) =>
    api.post<ApiResponse<CreatorSubscription>>('/admin/subscriptions/comp', { creator_id: creatorId, plan }, token),

  // Feature Flags
  listFlags: (token: string) =>
    api.get<ApiResponse<FeatureFlag[]>>('/admin/flags', token),

  toggleFlag: (key: string, enabled: boolean, token: string) =>
    api.put<ApiResponse<FeatureFlag>>(`/admin/flags/${key}`, { is_enabled: enabled }, token),

  // Campaigns
  listCampaigns: (token: string, params?: { status?: string; page?: number }) =>
    api.get<ApiResponse<{ campaigns: any[] }>>('/admin/campaigns', token, params),

  campaignStats: (token: string) =>
    api.get<ApiResponse<any>>('/admin/campaigns/stats', token),

  moderateCampaign: (id: string, status: string, reason: string, token: string) =>
    api.post<ApiResponse<any>>(`/admin/campaigns/${id}/moderate`, { status, reason }, token),

  approvePayout: (id: string, token: string) =>
    api.post<ApiResponse<any>>(`/admin/payouts/${id}/approve`, {}, token),

  processPayout: (id: string, token: string) =>
    api.post<ApiResponse<any>>(`/admin/payouts/${id}/process`, {}, token),

  // Audit
  auditLog: (token: string, params?: { entity_type?: string; action?: string; limit?: number; offset?: number }) =>
    api.get<ApiResponse<{ events: AuditEvent[]; total: number }>>('/admin/audit', token, params),
};

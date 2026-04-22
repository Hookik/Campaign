/**
 * Campaign API Service
 * Frontend service layer for campaign operations
 */

import api from '@/lib/api';
import type {
  ApiResponse, Campaign, CampaignApplication,
  CampaignSubmission, CampaignPayout, EarningsSummary
} from '@/types';

// ─── Brand Campaign API ───

export const brandCampaignApi = {
  create: (data: Partial<Campaign>, token: string) =>
    api.post<ApiResponse<Campaign>>('/campaigns', data, token),

  listMine: (token: string, params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ campaigns: Campaign[]; total: number }>>('/campaigns/mine', token, params),

  getById: (id: string, token: string) =>
    api.get<ApiResponse<Campaign>>(`/campaigns/${id}`, token),

  update: (id: string, data: Partial<Campaign>, token: string) =>
    api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, data, token),

  publish: (id: string, token: string) =>
    api.post<ApiResponse<Campaign>>(`/campaigns/${id}/publish`, {}, token),

  transition: (id: string, status: string, token: string) =>
    api.post<ApiResponse<Campaign>>(`/campaigns/${id}/transition`, { status }, token),

  listApplications: (campaignId: string, token: string, params?: { status?: string }) =>
    api.get<ApiResponse<{ applications: CampaignApplication[] }>>(`/campaigns/${campaignId}/applications`, token, params),

  updateApplicationStatus: (applicationId: string, status: string, token: string, brand_notes?: string) =>
    api.put<ApiResponse<CampaignApplication>>(`/campaigns/applications/${applicationId}/status`, { status, brand_notes }, token),

  getSubmissions: (applicationId: string, token: string) =>
    api.get<ApiResponse<CampaignSubmission[]>>(`/campaigns/applications/${applicationId}/submissions`, token),

  reviewSubmission: (submissionId: string, action: string, feedback: string, token: string) =>
    api.post<ApiResponse<CampaignSubmission>>(`/campaigns/submissions/${submissionId}/review`, { action, feedback }, token),

  createPayout: (campaignId: string, appId: string, data: { creator_id: string; payout_type: string; amount: number; notes?: string }, token: string) =>
    api.post<ApiResponse<CampaignPayout>>(`/campaigns/${campaignId}/applications/${appId}/payout`, data, token),

  listPayouts: (campaignId: string, token: string) =>
    api.get<ApiResponse<CampaignPayout[]>>(`/campaigns/${campaignId}/payouts`, token),
};

// ─── Creator Campaign API ───

export const creatorCampaignApi = {
  browse: (token: string, params?: { page?: number; search?: string; campaign_type?: string }) =>
    api.get<ApiResponse<{ campaigns: Campaign[] }>>('/creator/campaigns', token, params),

  viewCampaign: (id: string, token: string) =>
    api.get<ApiResponse<Campaign>>(`/creator/campaigns/${id}`, token),

  apply: (campaignId: string, data: { pitch: string; portfolio_urls?: string[]; proposed_rate?: number }, token: string) =>
    api.post<ApiResponse<CampaignApplication>>(`/creator/campaigns/${campaignId}/apply`, data, token),

  myApplications: (token: string, params?: { status?: string; page?: number }) =>
    api.get<ApiResponse<{ applications: CampaignApplication[] }>>('/creator/applications', token, params),

  withdraw: (applicationId: string, token: string) =>
    api.post<ApiResponse<CampaignApplication>>(`/creator/applications/${applicationId}/withdraw`, {}, token),

  submitDeliverable: (appId: string, delId: string, data: { content_url?: string; content_text?: string }, token: string) =>
    api.post<ApiResponse<CampaignSubmission>>(`/creator/applications/${appId}/deliverables/${delId}/submit`, data, token),

  earnings: (token: string, params?: { status?: string; page?: number }) =>
    api.get<ApiResponse<{ payouts: CampaignPayout[]; summary: EarningsSummary }>>('/creator/earnings', token, params),

  getEntitlements: (token: string) =>
    api.get<ApiResponse<{ plan: string; entitlements: Record<string, string> }>>('/creator/entitlements', token),

  checkEntitlement: (featureKey: string, token: string) =>
    api.get<ApiResponse<{ allowed: boolean; reason?: string; upgrade_to?: string }>>(`/creator/entitlements/${featureKey}`, token),
};

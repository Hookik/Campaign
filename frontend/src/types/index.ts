/**
 * Hookik Type Definitions
 * Shared types for campaigns, subscriptions, and entitlements
 */

// ─── Campaigns ───

export type CampaignType = 'fixed_fee' | 'fee_plus_commission' | 'gifted' | 'invite_only' | 'open';
export type CampaignVisibility = 'public' | 'invite_only' | 'premium_only';
export type CampaignStatus = 'draft' | 'published' | 'accepting' | 'reviewing' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'archived';
export type BudgetType = 'flat' | 'variable' | 'total';

export interface Campaign {
  id: string;
  business_id: string;
  business_name?: string;
  title: string;
  slug: string;
  brief: string;
  campaign_type: CampaignType;
  visibility: CampaignVisibility;
  status: CampaignStatus;
  budget_type: BudgetType;
  fee_per_creator: number | null;
  fee_min: number | null;
  fee_max: number | null;
  total_budget: number | null;
  commission_on_top: boolean;
  commission_rate: number | null;
  max_creators: number | null;
  application_deadline: string | null;
  content_deadline: string | null;
  review_rules: string | null;
  approval_rules: string | null;
  allow_negotiation: boolean;
  require_pro: boolean;
  require_pro_plus: boolean;
  cover_image_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
  products?: CampaignProduct[];
  requirements?: CampaignRequirement[];
  deliverables?: CampaignDeliverable[];
  // Entitlement enrichment (creator view)
  can_view?: boolean;
  can_apply?: boolean;
  view_reason?: string;
  apply_reason?: string;
  upgrade_to?: string;
  locked?: boolean;
}

export interface CampaignProduct {
  id: string;
  campaign_id: string;
  product_id: string;
  product_name: string;
  price: number;
  image_url: string;
}

export interface CampaignRequirement {
  id: string;
  campaign_id: string;
  req_type: string;
  req_value: string;
  is_required: boolean;
}

export interface CampaignDeliverable {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  deliverable_type: string | null;
  quantity: number;
  sort_order: number;
}

// ─── Applications ───

export type ApplicationStatus = 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'cancelled';

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: ApplicationStatus;
  pitch: string;
  portfolio_urls: string[];
  sample_urls: string[];
  proposed_rate: number | null;
  brand_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  campaign_title?: string;
  campaign_status?: string;
  business_name?: string;
  creator_name?: string;
  handle?: string;
  profile_image_url?: string;
  subscription_tier?: string;
  is_verified?: boolean;
  fee_per_creator?: number;
  campaign_type?: CampaignType;
}

// ─── Submissions ───

export type SubmissionStatus = 'submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected';

export interface CampaignSubmission {
  id: string;
  application_id: string;
  deliverable_id: string;
  creator_id: string;
  status: SubmissionStatus;
  content_url: string | null;
  content_text: string | null;
  attachments: string[];
  brand_feedback: string | null;
  revision_count: number;
  submitted_at: string;
  reviewed_at: string | null;
  deliverable_title?: string;
  deliverable_type?: string;
}

// ─── Payouts ───

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'reversed';
export type PayoutType = 'fixed_fee' | 'commission' | 'bonus';

export interface CampaignPayout {
  id: string;
  campaign_id: string;
  application_id: string;
  creator_id: string;
  payout_type: PayoutType;
  amount: number;
  currency: string;
  status: PayoutStatus;
  paid_at: string | null;
  wallet_txn_id: string | null;
  notes: string | null;
  campaign_title?: string;
  creator_name?: string;
}

export interface EarningsSummary {
  total_earned: number;
  total_pending: number;
  total_approved: number;
  campaign_fees_earned: number;
  affiliate_commissions_earned: number;
  campaign_fees_pending: number;
  affiliate_commissions_pending: number;
}

// ─── Subscriptions ───

export type PlanSlug = 'free' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'paused' | 'comped';

export interface SubscriptionPlan {
  id: string;
  slug: PlanSlug;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_label: string;
  feature_value: string;
  sort_order: number;
}

export interface CreatorSubscription {
  id: string;
  creator_id: string;
  plan_id: string;
  plan_slug: PlanSlug;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_monthly: number;
  price_annual: number | null;
}

// ─── Entitlements ───

export interface EntitlementCheck {
  allowed: boolean;
  reason?: string;
  upgrade_to?: string;
}

export interface CreatorEntitlements {
  plan: PlanSlug;
  status: SubscriptionStatus;
  entitlements: Record<string, string>;
}

// ─── Feature Flags ───

export interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_label: string;
  is_enabled: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Audit ───

export interface AuditEvent {
  id: string;
  actor_id: string | null;
  actor_type: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

// ─── API Response ───

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  reason?: string;
  upgrade_to?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

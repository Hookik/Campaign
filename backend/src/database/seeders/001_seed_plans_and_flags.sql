-- Seeder: 001_seed_plans_and_flags
-- Description: Seed subscription plans, plan features, and feature flags
-- Date: 2026-04-22

-- Subscription Plans
INSERT INTO subscription_plans (id, slug, name, description, price_monthly, price_annual, sort_order) VALUES
  (UUID(), 'free', 'Free', 'Basic creator access. Earn through the affiliate marketplace.', 0.00, NULL, 0),
  (UUID(), 'pro', 'Creator Pro', 'Access paid campaigns, premium analytics, and verified badge.', 4500.00, 43200.00, 1),
  (UUID(), 'pro_plus', 'Creator Pro+', 'Everything in Pro plus elite campaign access and priority placement.', 12000.00, 115200.00, 2);

-- Plan Features: Free
INSERT INTO plan_features (id, plan_id, feature_key, feature_label, feature_value, sort_order) VALUES
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'affiliate_marketplace', 'Affiliate marketplace', 'true', 1),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'basic_storefront', 'Basic storefront', 'true', 2),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'basic_analytics', 'Basic analytics', 'true', 3),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'paid_campaigns', 'Paid campaign access', 'false', 4),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'premium_analytics', 'Premium analytics', 'false', 5),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'verified_badge', 'Verified badge', 'false', 6),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'campaign_visibility', 'Campaign visibility', 'limited', 7),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='free'), 'max_campaigns_visible', 'Campaigns visible', '3', 8);

-- Plan Features: Pro
INSERT INTO plan_features (id, plan_id, feature_key, feature_label, feature_value, sort_order) VALUES
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'affiliate_marketplace', 'Affiliate marketplace', 'true', 1),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'basic_storefront', 'Basic storefront', 'true', 2),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'basic_analytics', 'Basic analytics', 'true', 3),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'paid_campaigns', 'Paid campaign access', 'true', 4),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'premium_analytics', 'Premium analytics', 'true', 5),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'verified_badge', 'Verified Pro badge', 'true', 6),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'campaign_visibility', 'Campaign visibility', 'full', 7),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'priority_placement', 'Priority brand visibility', 'true', 8),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'max_campaigns_visible', 'Campaigns visible', 'unlimited', 9),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro'), 'creator_intelligence', 'Top-post insights', 'basic', 10);

-- Plan Features: Pro+
INSERT INTO plan_features (id, plan_id, feature_key, feature_label, feature_value, sort_order) VALUES
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'affiliate_marketplace', 'Affiliate marketplace', 'true', 1),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'basic_storefront', 'Basic storefront', 'true', 2),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'basic_analytics', 'Basic analytics', 'true', 3),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'paid_campaigns', 'Paid campaign access', 'true', 4),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'premium_analytics', 'Advanced analytics', 'true', 5),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'verified_badge', 'Verified Pro+ badge', 'true', 6),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'campaign_visibility', 'Campaign visibility', 'full', 7),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'priority_placement', 'Featured placement', 'true', 8),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'max_campaigns_visible', 'Campaigns visible', 'unlimited', 9),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'creator_intelligence', 'Deep benchmarking', 'advanced', 10),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'elite_campaigns', 'High-budget campaigns', 'true', 11),
  (UUID(), (SELECT id FROM subscription_plans WHERE slug='pro_plus'), 'priority_support', 'Priority support', 'true', 12);

-- Feature Flags
INSERT INTO feature_flags (id, flag_key, flag_label, is_enabled) VALUES
  (UUID(), 'paid_campaigns', 'Paid Campaigns Module', FALSE),
  (UUID(), 'creator_subscriptions', 'Creator Subscription System', FALSE),
  (UUID(), 'premium_analytics', 'Premium Analytics Dashboard', FALSE),
  (UUID(), 'campaign_commission_hybrid', 'Fee + Commission Hybrid Mode', FALSE);

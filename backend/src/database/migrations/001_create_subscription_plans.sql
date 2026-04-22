-- Migration: 001_create_subscription_plans
-- Description: Create subscription_plans and plan_features tables
-- Date: 2026-04-22

-- UP
CREATE TABLE IF NOT EXISTS subscription_plans (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  price_annual DECIMAL(12,2) DEFAULT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subplans_slug (slug),
  INDEX idx_subplans_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS plan_features (
  id CHAR(36) PRIMARY KEY,
  plan_id CHAR(36) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  feature_label VARCHAR(200) DEFAULT NULL,
  feature_value VARCHAR(200) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_plan_feature (plan_id, feature_key),
  INDEX idx_planfeat_plan (plan_id),
  INDEX idx_planfeat_key (feature_key),
  CONSTRAINT fk_planfeat_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS plan_features;
-- DROP TABLE IF EXISTS subscription_plans;

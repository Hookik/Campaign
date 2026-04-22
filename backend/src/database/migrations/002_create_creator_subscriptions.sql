-- Migration: 002_create_creator_subscriptions
-- Description: Create creator_subscriptions table + add columns to creators
-- Date: 2026-04-22

-- UP

-- Additive columns on existing creators table
ALTER TABLE creators
  ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free',
  ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS creator_subscriptions (
  id CHAR(36) PRIMARY KEY,
  creator_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    COMMENT 'active, trialing, past_due, cancelled, expired, paused, comped',
  payment_provider VARCHAR(30) DEFAULT 'paystack',
  provider_sub_id VARCHAR(200) DEFAULT NULL,
  current_period_start TIMESTAMP NULL DEFAULT NULL,
  current_period_end TIMESTAMP NULL DEFAULT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  trial_end TIMESTAMP NULL DEFAULT NULL,
  grace_period_end TIMESTAMP NULL DEFAULT NULL,
  assigned_by CHAR(36) DEFAULT NULL COMMENT 'admin who comped/assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_creatorsub_creator (creator_id),
  INDEX idx_creatorsub_status (status),
  INDEX idx_creatorsub_plan (plan_id),
  CONSTRAINT fk_creatorsub_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  CONSTRAINT fk_creatorsub_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS creator_subscriptions;
-- ALTER TABLE creators DROP COLUMN subscription_tier, DROP COLUMN is_verified;

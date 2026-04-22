-- Migration: 005_create_payouts_flags_audit
-- Description: Create campaign_payouts, feature_flags, audit_events tables
-- Date: 2026-04-22

-- UP
CREATE TABLE IF NOT EXISTS campaign_payouts (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  application_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  payout_type VARCHAR(20) NOT NULL
    COMMENT 'fixed_fee, commission, bonus',
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'pending'
    COMMENT 'pending, approved, processing, paid, failed, reversed',
  approved_by CHAR(36) DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  wallet_txn_id CHAR(36) DEFAULT NULL
    COMMENT 'FK to existing wallet/payout system',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_campayout_campaign (campaign_id),
  INDEX idx_campayout_creator (creator_id),
  INDEX idx_campayout_status (status),
  CONSTRAINT fk_campayout_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campayout_app FOREIGN KEY (application_id) REFERENCES campaign_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_campayout_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feature_flags (
  id CHAR(36) PRIMARY KEY,
  flag_key VARCHAR(100) NOT NULL UNIQUE,
  flag_label VARCHAR(200) DEFAULT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  metadata JSON DEFAULT NULL,
  updated_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_flag_key (flag_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_events (
  id CHAR(36) PRIMARY KEY,
  actor_id CHAR(36) DEFAULT NULL,
  actor_type VARCHAR(20) DEFAULT NULL
    COMMENT 'creator, business, admin, system',
  entity_type VARCHAR(50) NOT NULL
    COMMENT 'campaign, subscription, application',
  entity_id CHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL
    COMMENT 'campaign.published, subscription.upgraded, etc.',
  old_state JSON DEFAULT NULL,
  new_state JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_actor (actor_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS audit_events;
-- DROP TABLE IF EXISTS feature_flags;
-- DROP TABLE IF EXISTS campaign_payouts;

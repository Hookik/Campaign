-- Migration: 003_create_campaigns
-- Description: Create campaigns + campaign_products + campaign_requirements tables
-- Date: 2026-04-22

-- UP
CREATE TABLE IF NOT EXISTS campaigns (
  id CHAR(36) PRIMARY KEY,
  business_id CHAR(36) NOT NULL,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) DEFAULT NULL,
  brief TEXT COMMENT 'Rich text / markdown campaign brief',
  campaign_type VARCHAR(30) NOT NULL
    COMMENT 'fixed_fee, fee_plus_commission, gifted, invite_only, open',
  visibility VARCHAR(20) DEFAULT 'public'
    COMMENT 'public, invite_only, premium_only',
  status VARCHAR(30) DEFAULT 'draft'
    COMMENT 'draft, published, accepting, reviewing, in_progress, completed, cancelled, expired, archived',
  budget_type VARCHAR(20) DEFAULT 'flat'
    COMMENT 'flat (per creator), variable (range), total (campaign total)',
  fee_per_creator DECIMAL(12,2) DEFAULT NULL,
  fee_min DECIMAL(12,2) DEFAULT NULL,
  fee_max DECIMAL(12,2) DEFAULT NULL,
  total_budget DECIMAL(12,2) DEFAULT NULL,
  commission_on_top BOOLEAN DEFAULT FALSE
    COMMENT 'Creator also earns affiliate percentage',
  commission_rate DECIMAL(5,2) DEFAULT NULL
    COMMENT 'Percentage if commission_on_top is true',
  max_creators INT DEFAULT NULL,
  application_deadline TIMESTAMP NULL DEFAULT NULL,
  content_deadline TIMESTAMP NULL DEFAULT NULL,
  review_rules TEXT DEFAULT NULL,
  approval_rules TEXT DEFAULT NULL,
  allow_negotiation BOOLEAN DEFAULT FALSE,
  require_pro BOOLEAN DEFAULT FALSE
    COMMENT 'Only Pro/Pro+ creators can apply',
  require_pro_plus BOOLEAN DEFAULT FALSE
    COMMENT 'Only Pro+ creators can apply',
  cover_image_url VARCHAR(500) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_campaign_biz (business_id),
  INDEX idx_campaign_status (status),
  INDEX idx_campaign_type (campaign_type),
  INDEX idx_campaign_visibility (visibility),
  INDEX idx_campaign_deadline (application_deadline),
  INDEX idx_campaign_published (published_at),
  CONSTRAINT fk_campaign_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_products (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_camp_product (campaign_id, product_id),
  INDEX idx_camprod_campaign (campaign_id),
  INDEX idx_camprod_product (product_id),
  CONSTRAINT fk_camprod_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_camprod_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_requirements (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  req_type VARCHAR(50) NOT NULL
    COMMENT 'niche, location, platform, follower_min, follower_max, engagement_min, content_type, custom',
  req_value VARCHAR(300) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_campreq_campaign (campaign_id),
  INDEX idx_campreq_type (req_type),
  CONSTRAINT fk_campreq_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS campaign_requirements;
-- DROP TABLE IF EXISTS campaign_products;
-- DROP TABLE IF EXISTS campaigns;

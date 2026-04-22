-- Migration: 004_create_campaign_applications
-- Description: Create campaign_applications, campaign_invites, campaign_deliverables, campaign_submissions tables
-- Date: 2026-04-22

-- UP
CREATE TABLE IF NOT EXISTS campaign_applications (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  status VARCHAR(30) DEFAULT 'applied'
    COMMENT 'applied, shortlisted, accepted, rejected, withdrawn, cancelled',
  pitch TEXT DEFAULT NULL,
  portfolio_urls JSON DEFAULT NULL,
  sample_urls JSON DEFAULT NULL,
  proposed_rate DECIMAL(12,2) DEFAULT NULL
    COMMENT 'If campaign allows negotiation',
  brand_notes TEXT DEFAULT NULL
    COMMENT 'Internal brand notes',
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  reviewed_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_camp_creator (campaign_id, creator_id),
  INDEX idx_campapp_campaign (campaign_id),
  INDEX idx_campapp_creator (creator_id),
  INDEX idx_campapp_status (status),
  CONSTRAINT fk_campapp_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campapp_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_invites (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  invited_by CHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    COMMENT 'pending, accepted, declined, expired',
  message TEXT DEFAULT NULL,
  responded_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_campinv (campaign_id, creator_id),
  INDEX idx_campinv_campaign (campaign_id),
  INDEX idx_campinv_creator (creator_id),
  INDEX idx_campinv_status (status),
  CONSTRAINT fk_campinv_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campinv_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  CONSTRAINT fk_campinv_business FOREIGN KEY (invited_by) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_deliverables (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT DEFAULT NULL,
  deliverable_type VARCHAR(50) DEFAULT NULL
    COMMENT 'instagram_post, instagram_story, tiktok_video, youtube_video, whatsapp_status, blog_post, product_review, unboxing, custom',
  quantity INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_campdel_campaign (campaign_id),
  CONSTRAINT fk_campdel_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_submissions (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  deliverable_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  status VARCHAR(30) DEFAULT 'submitted'
    COMMENT 'submitted, under_review, revision_requested, approved, rejected',
  content_url VARCHAR(500) DEFAULT NULL,
  content_text TEXT DEFAULT NULL,
  attachments JSON DEFAULT NULL,
  brand_feedback TEXT DEFAULT NULL,
  revision_count INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  reviewed_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_campsub_app (application_id),
  INDEX idx_campsub_deliverable (deliverable_id),
  INDEX idx_campsub_creator (creator_id),
  INDEX idx_campsub_status (status),
  CONSTRAINT fk_campsub_app FOREIGN KEY (application_id) REFERENCES campaign_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_campsub_deliverable FOREIGN KEY (deliverable_id) REFERENCES campaign_deliverables(id) ON DELETE CASCADE,
  CONSTRAINT fk_campsub_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS campaign_submissions;
-- DROP TABLE IF EXISTS campaign_deliverables;
-- DROP TABLE IF EXISTS campaign_invites;
-- DROP TABLE IF EXISTS campaign_applications;

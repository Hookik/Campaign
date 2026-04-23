-- Migration: 006_create_storefront_products
-- Description: Create storefront_products table for the Campaign + Affiliate hybrid model.
--              When a creator is accepted on a hybrid campaign, campaign products are
--              auto-added to their storefront. Creators also earn ongoing affiliate
--              commission on sales generated through their storefront links.
-- Date: 2026-04-22

-- UP
CREATE TABLE IF NOT EXISTS storefront_products (
  id CHAR(36) PRIMARY KEY,
  creator_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT NULL COMMENT 'Override commission rate (null = use product default)',
  source ENUM('manual', 'campaign', 'invite') DEFAULT 'manual' COMMENT 'How the product was added',
  source_campaign_id CHAR(36) DEFAULT NULL COMMENT 'Campaign that triggered the auto-add',
  is_active TINYINT(1) DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_creator_product (creator_id, product_id),
  INDEX idx_sf_creator (creator_id),
  INDEX idx_sf_product (product_id),
  INDEX idx_sf_source_campaign (source_campaign_id),

  CONSTRAINT fk_sf_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  CONSTRAINT fk_sf_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_sf_campaign FOREIGN KEY (source_campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS storefront_products;

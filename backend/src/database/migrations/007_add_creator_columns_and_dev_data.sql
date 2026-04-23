-- 007: Add missing creator columns + seed dev users and products
-- UP

ALTER TABLE creators ADD COLUMN name VARCHAR(200) DEFAULT NULL AFTER display_name;
ALTER TABLE creators ADD COLUMN handle VARCHAR(100) DEFAULT NULL AFTER name;
ALTER TABLE creators ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL AFTER handle;

UPDATE creators SET name = display_name WHERE name IS NULL;

INSERT IGNORE INTO businesses (id, name, email, industry, website, status)
VALUES ('biz00000-0000-0000-0000-000000000001', 'Demo Brand', 'brand@hookik.test', 'Beauty & Skincare', 'https://demobrand.hookik.test', 'active');

INSERT IGNORE INTO creators (id, display_name, name, handle, email, niche, follower_count, status, subscription_tier, is_verified)
VALUES ('c0000000-0000-0000-0000-000000000001', 'Demo Creator', 'Demo Creator', 'democreator', 'creator@hookik.test', 'lifestyle', 25000, 'active', 'pro', TRUE);

INSERT IGNORE INTO products (id, business_id, name, description, price, currency, image_url, status) VALUES
('prod0000-0000-0000-0000-000000000001', 'biz00000-0000-0000-0000-000000000001', 'Glow Serum SPF30', 'Lightweight daily serum with SPF protection and vitamin C', 12500.00, 'NGN', NULL, 'active'),
('prod0000-0000-0000-0000-000000000002', 'biz00000-0000-0000-0000-000000000001', 'Hydrating Face Mist', 'Refreshing rose water mist for all skin types', 7500.00, 'NGN', NULL, 'active'),
('prod0000-0000-0000-0000-000000000003', 'biz00000-0000-0000-0000-000000000001', 'Night Repair Cream', 'Rich overnight moisturizer with retinol and shea butter', 18000.00, 'NGN', NULL, 'active'),
('prod0000-0000-0000-0000-000000000004', 'biz00000-0000-0000-0000-000000000001', 'Vitamin C Cleanser', 'Gentle foaming cleanser with brightening vitamin C', 9500.00, 'NGN', NULL, 'active'),
('prod0000-0000-0000-0000-000000000005', 'biz00000-0000-0000-0000-000000000001', 'Lip Gloss Collection', 'Set of 4 shimmering lip glosses in seasonal shades', 15000.00, 'NGN', NULL, 'active');

-- DOWN
-- DELETE FROM products WHERE business_id = 'biz00000-0000-0000-0000-000000000001';
-- DELETE FROM creators WHERE id = 'c0000000-0000-0000-0000-000000000001';
-- DELETE FROM businesses WHERE id = 'biz00000-0000-0000-0000-000000000001';
-- ALTER TABLE creators DROP COLUMN name, DROP COLUMN handle, DROP COLUMN profile_image_url;

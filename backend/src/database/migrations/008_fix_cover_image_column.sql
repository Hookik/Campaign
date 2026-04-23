-- 008: Change cover_image_url from VARCHAR(500) to MEDIUMTEXT to support base64 data URLs
-- UP

ALTER TABLE campaigns MODIFY COLUMN cover_image_url MEDIUMTEXT DEFAULT NULL;

-- DOWN
-- ALTER TABLE campaigns MODIFY COLUMN cover_image_url VARCHAR(500) DEFAULT NULL;

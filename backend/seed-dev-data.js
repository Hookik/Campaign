/**
 * Quick script to seed dev data (business, creator, products)
 * Run: node seed-dev-data.js
 */
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hookik',
    multipleStatements: true,
  });

  try {
    // Check if products already exist
    const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM products WHERE business_id = 'biz00000-0000-0000-0000-000000000001'");
    if (existing[0].cnt > 0) {
      console.log(`✅ Products already exist (${existing[0].cnt} found). Nothing to do.`);
      await conn.end();
      return;
    }

    // Insert business
    await conn.execute(
      "INSERT IGNORE INTO businesses (id, name, email, industry, website, status) VALUES (?, ?, ?, ?, ?, ?)",
      ['biz00000-0000-0000-0000-000000000001', 'Demo Brand', 'brand@hookik.test', 'Beauty & Skincare', 'https://demobrand.hookik.test', 'active']
    );
    console.log('✅ Business inserted');

    // Insert creator
    await conn.execute(
      "INSERT IGNORE INTO creators (id, display_name, name, handle, email, niche, follower_count, status, subscription_tier, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ['c0000000-0000-0000-0000-000000000001', 'Demo Creator', 'Demo Creator', 'democreator', 'creator@hookik.test', 'lifestyle', 25000, 'active', 'pro', true]
    );
    console.log('✅ Creator inserted');

    // Insert products
    const products = [
      ['prod0000-0000-0000-0000-000000000001', 'Glow Serum SPF30', 'Lightweight daily serum with SPF protection and vitamin C', 12500.00],
      ['prod0000-0000-0000-0000-000000000002', 'Hydrating Face Mist', 'Refreshing rose water mist for all skin types', 7500.00],
      ['prod0000-0000-0000-0000-000000000003', 'Night Repair Cream', 'Rich overnight moisturizer with retinol and shea butter', 18000.00],
      ['prod0000-0000-0000-0000-000000000004', 'Vitamin C Cleanser', 'Gentle foaming cleanser with brightening vitamin C', 9500.00],
      ['prod0000-0000-0000-0000-000000000005', 'Lip Gloss Collection', 'Set of 4 shimmering lip glosses in seasonal shades', 15000.00],
    ];

    for (const [id, name, desc, price] of products) {
      await conn.execute(
        "INSERT IGNORE INTO products (id, business_id, name, description, price, currency, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, 'biz00000-0000-0000-0000-000000000001', name, desc, price, 'NGN', null, 'active']
      );
    }
    console.log('✅ 5 products inserted');

    // Mark migration as done so it doesn't try to run again
    await conn.execute(
      "INSERT IGNORE INTO _migrations (filename) VALUES ('007_add_creator_columns_and_dev_data.sql')"
    );
    console.log('✅ Migration 007 marked as executed');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await conn.end();
  }
}

main();

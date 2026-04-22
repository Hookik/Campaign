/**
 * Database Migration Runner
 * Runs SQL migrations in order against MySQL database.
 *
 * Usage:
 *   node src/database/migrate.js          # Run all pending migrations
 *   node src/database/migrate.js --seed   # Run migrations + seed data
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDERS_DIR = path.join(__dirname, 'seeders');

async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hookik',
    multipleStatements: true,
  });
}

async function ensureMigrationsTable(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function getExecutedMigrations(conn) {
  const [rows] = await conn.execute('SELECT filename FROM _migrations ORDER BY id');
  return new Set(rows.map(r => r.filename));
}

async function runMigrations(conn) {
  await ensureMigrationsTable(conn);
  const executed = await getExecutedMigrations(conn);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`  ✓ ${file} (already executed)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    // Extract only the UP portion (everything before -- DOWN)
    const upSql = sql.split('-- DOWN')[0];

    try {
      await conn.query(upSql);
      await conn.execute('INSERT INTO _migrations (filename) VALUES (?)', [file]);
      console.log(`  ▶ ${file} (executed)`);
      count++;
    } catch (err) {
      console.error(`  ✗ ${file} FAILED:`, err.message);
      throw err;
    }
  }

  return count;
}

async function runSeeders(conn) {
  const files = fs.readdirSync(SEEDERS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SEEDERS_DIR, file), 'utf-8');
    try {
      await conn.query(sql);
      console.log(`  ▶ ${file} (seeded)`);
    } catch (err) {
      // Duplicate key errors are OK for seeds (idempotent)
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`  ✓ ${file} (already seeded)`);
      } else {
        console.error(`  ✗ ${file} FAILED:`, err.message);
        throw err;
      }
    }
  }
}

async function main() {
  const conn = await getConnection();
  const shouldSeed = process.argv.includes('--seed');

  try {
    console.log('\n🔄 Running migrations...\n');
    const count = await runMigrations(conn);
    console.log(`\n✅ ${count} migration(s) applied.\n`);

    if (shouldSeed) {
      console.log('🌱 Running seeders...\n');
      await runSeeders(conn);
      console.log('\n✅ Seeding complete.\n');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();

/**
 * Feature Flag Service
 * Manages global feature toggles
 */

const { pool } = require('../../config/database');
const { generateId } = require('../../utils/uuid');

class FeatureFlagService {
  /**
   * Check if a feature flag is globally enabled
   */
  async isEnabled(flagKey) {
    const [rows] = await pool.execute(
      'SELECT is_enabled FROM feature_flags WHERE flag_key = ?',
      [flagKey]
    );
    if (rows.length === 0) return true; // If no flag exists, feature is unrestricted
    return rows[0].is_enabled === 1 || rows[0].is_enabled === true;
  }

  /**
   * Get all feature flags
   */
  async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM feature_flags ORDER BY flag_key'
    );
    return rows;
  }

  /**
   * Toggle a feature flag
   */
  async toggle(flagKey, enabled, updatedBy = null) {
    const [result] = await pool.execute(
      'UPDATE feature_flags SET is_enabled = ?, updated_by = ? WHERE flag_key = ?',
      [enabled, updatedBy, flagKey]
    );

    if (result.affectedRows === 0) {
      // Create the flag if it doesn't exist
      await pool.execute(
        'INSERT INTO feature_flags (id, flag_key, is_enabled, updated_by) VALUES (?, ?, ?, ?)',
        [generateId(), flagKey, enabled, updatedBy]
      );
    }

    return { flag_key: flagKey, is_enabled: enabled };
  }

  /**
   * Get a single flag
   */
  async getFlag(flagKey) {
    const [rows] = await pool.execute(
      'SELECT * FROM feature_flags WHERE flag_key = ?',
      [flagKey]
    );
    return rows[0] || null;
  }
}

module.exports = new FeatureFlagService();

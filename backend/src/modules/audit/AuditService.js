/**
 * Audit Service
 * Records all significant actions for compliance and debugging
 */

const { pool } = require('../../config/database');
const { generateId } = require('../../utils/uuid');

class AuditService {
  /**
   * Log an audit event
   */
  async log({ actorId, actorType, entityType, entityId, action, oldState, newState, req }) {
    const id = generateId();

    await pool.execute(
      `INSERT INTO audit_events
        (id, actor_id, actor_type, entity_type, entity_id, action, old_state, new_state, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        actorId || null,
        actorType || null,
        entityType,
        entityId,
        action,
        oldState ? JSON.stringify(oldState) : null,
        newState ? JSON.stringify(newState) : null,
        req?.ip || null,
        req?.headers?.['user-agent'] || null,
      ]
    );

    return id;
  }

  /**
   * Query audit events with filters
   */
  async query({ entityType, entityId, actorId, action, limit = 50, offset = 0 }) {
    let sql = 'SELECT * FROM audit_events WHERE 1=1';
    const params = [];

    if (entityType) {
      sql += ' AND entity_type = ?';
      params.push(entityType);
    }
    if (entityId) {
      sql += ' AND entity_id = ?';
      params.push(entityId);
    }
    if (actorId) {
      sql += ' AND actor_id = ?';
      params.push(actorId);
    }
    if (action) {
      sql += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [rows] = await pool.query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM audit_events WHERE 1=1';
    const countParams = [];
    if (entityType) { countSql += ' AND entity_type = ?'; countParams.push(entityType); }
    if (entityId) { countSql += ' AND entity_id = ?'; countParams.push(entityId); }
    if (actorId) { countSql += ' AND actor_id = ?'; countParams.push(actorId); }
    if (action) { countSql += ' AND action LIKE ?'; countParams.push(`%${action}%`); }

    const [countRows] = await pool.execute(countSql, countParams);

    return {
      events: rows,
      total: countRows[0].total,
      limit,
      offset,
    };
  }
}

module.exports = new AuditService();

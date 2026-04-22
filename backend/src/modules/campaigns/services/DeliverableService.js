/**
 * Deliverable Service
 * Handles campaign deliverable submissions and reviews
 */

const { pool } = require('../../../config/database');
const { generateId } = require('../../../utils/uuid');
const { ApiError } = require('../../../utils/ApiError');
const auditService = require('../../audit/AuditService');

class DeliverableService {
  /**
   * Submit a deliverable
   */
  async submit(applicationId, deliverableId, creatorId, data) {
    // Verify application is accepted
    const [apps] = await pool.execute(
      "SELECT * FROM campaign_applications WHERE id = ? AND creator_id = ? AND status = 'accepted'",
      [applicationId, creatorId]
    );
    if (apps.length === 0) {
      throw ApiError.badRequest('Application not in accepted state');
    }

    // Check if already submitted
    const [existing] = await pool.execute(
      `SELECT * FROM campaign_submissions
       WHERE application_id = ? AND deliverable_id = ? AND creator_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [applicationId, deliverableId, creatorId]
    );

    // If revision requested, allow resubmit
    if (existing.length > 0 && existing[0].status !== 'revision_requested') {
      throw ApiError.conflict('Deliverable already submitted');
    }

    const id = generateId();
    const revisionCount = existing.length > 0 ? existing[0].revision_count + 1 : 0;

    await pool.execute(
      `INSERT INTO campaign_submissions
        (id, application_id, deliverable_id, creator_id, status,
         content_url, content_text, attachments, revision_count)
       VALUES (?, ?, ?, ?, 'submitted', ?, ?, ?, ?)`,
      [
        id, applicationId, deliverableId, creatorId,
        data.content_url || null,
        data.content_text || null,
        data.attachments ? JSON.stringify(data.attachments) : null,
        revisionCount,
      ]
    );

    await auditService.log({
      actorId: creatorId,
      actorType: 'creator',
      entityType: 'submission',
      entityId: id,
      action: 'submission.submitted',
      newState: { deliverable_id: deliverableId, revision: revisionCount },
    });

    return this.getSubmissionById(id);
  }

  /**
   * Review a submission (brand action)
   */
  async review(submissionId, reviewerId, action, feedback) {
    const sub = await this.getSubmissionById(submissionId);
    if (!sub) throw ApiError.notFound('Submission not found');
    if (!['submitted', 'under_review'].includes(sub.status)) {
      throw ApiError.badRequest('Submission not in reviewable state');
    }

    const validActions = ['approve', 'request_revision', 'reject'];
    if (!validActions.includes(action)) {
      throw ApiError.badRequest('Invalid review action');
    }

    const statusMap = {
      approve: 'approved',
      request_revision: 'revision_requested',
      reject: 'rejected',
    };

    const newStatus = statusMap[action];

    await pool.execute(
      `UPDATE campaign_submissions
       SET status = ?, brand_feedback = ?, reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ?`,
      [newStatus, feedback || null, reviewerId, submissionId]
    );

    await auditService.log({
      actorId: reviewerId,
      actorType: 'business',
      entityType: 'submission',
      entityId: submissionId,
      action: `submission.${newStatus}`,
      oldState: { status: sub.status },
      newState: { status: newStatus, feedback },
    });

    return this.getSubmissionById(submissionId);
  }

  /**
   * Get submissions for an application
   */
  async getByApplication(applicationId) {
    const [rows] = await pool.execute(
      `SELECT cs.*, cd.title as deliverable_title, cd.deliverable_type
       FROM campaign_submissions cs
       JOIN campaign_deliverables cd ON cs.deliverable_id = cd.id
       WHERE cs.application_id = ?
       ORDER BY cd.sort_order, cs.created_at DESC`,
      [applicationId]
    );
    return rows;
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id) {
    const [rows] = await pool.execute(
      `SELECT cs.*, cd.title as deliverable_title, cd.deliverable_type
       FROM campaign_submissions cs
       JOIN campaign_deliverables cd ON cs.deliverable_id = cd.id
       WHERE cs.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new DeliverableService();

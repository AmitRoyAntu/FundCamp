import { query } from '../config/db.js';

export const Report = {
  create: async ({ campaignId, reporterId, reporterName, reporterEmail, reason, description }) => {
    const sql = `
      INSERT INTO campaign_reports (campaign_id, reporter_id, reporter_name, reporter_email, reason, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;
    const result = await query(sql, [
      campaignId,
      reporterId || null,
      reporterName || 'Campus Member',
      reporterEmail || null,
      reason,
      description
    ]);
    return result.rows[0];
  },

  findAllForAdmin: async ({ status } = {}) => {
    let sql = `
      SELECT r.*,
             c.title as campaign_title,
             c.category as campaign_category,
             c.status as campaign_status,
             c.image as campaign_image,
             u.id as creator_id,
             u.name as creator_name,
             u.email as creator_email,
             u.department as creator_department,
             COALESCE(u.status, 'active') as creator_status
      FROM campaign_reports r
      JOIN campaigns c ON r.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND r.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END, r.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  findById: async (id) => {
    const sql = `
      SELECT r.*,
             c.title as campaign_title,
             c.category as campaign_category,
             c.status as campaign_status,
             u.id as creator_id,
             u.name as creator_name,
             u.email as creator_email,
             u.department as creator_department,
             COALESCE(u.status, 'active') as creator_status
      FROM campaign_reports r
      JOIN campaigns c ON r.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE r.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  updateStatus: async (id, { status, adminNotes }) => {
    const sql = `
      UPDATE campaign_reports
      SET status = $1,
          admin_notes = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [status, adminNotes || null, id]);
    return result.rows[0] || null;
  }
};

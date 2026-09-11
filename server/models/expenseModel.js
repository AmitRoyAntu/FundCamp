import { query } from '../config/db.js';

export const Expense = {
  findAllForAdmin: async ({ status, campaignId } = {}) => {
    let sql = `
      SELECT e.*, 
             c.title as campaign_title, 
             c.category as campaign_category, 
             u.name as creator_name
      FROM expense_receipts e
      JOIN campaigns c ON e.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND e.status = $${paramIndex++}`;
      params.push(status);
    }
    if (campaignId) {
      sql += ` AND e.campaign_id = $${paramIndex++}`;
      params.push(campaignId);
    }

    sql += ` ORDER BY e.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  updateStatus: async (id, { status, adminNotes }) => {
    const sql = `
      UPDATE expense_receipts
      SET status = $1,
          admin_notes = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [status, adminNotes || null, id]);
    return result.rows[0] || null;
  },

  create: async ({ campaignId, title, amount, vendor, category, receiptUrl, receiptName }) => {
    const sql = `
      INSERT INTO expense_receipts (campaign_id, title, amount, vendor, category, receipt_url, receipt_name, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `;
    const result = await query(sql, [
      campaignId,
      title,
      amount,
      vendor || 'University Vendor',
      category || 'Equipment',
      receiptUrl || null,
      receiptName || null
    ]);
    return result.rows[0];
  }
};

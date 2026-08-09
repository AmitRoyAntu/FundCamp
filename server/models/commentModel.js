import { query } from '../config/db.js';

export const CampaignComment = {
  findByCampaignId: async (campaignId) => {
    const sql = `
      SELECT c.*, u.name as user_name, u.department as user_department, u.user_type
      FROM campaign_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.campaign_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await query(sql, [campaignId]);
    return result.rows;
  },

  create: async ({ campaignId, userId, content }) => {
    const sql = `
      INSERT INTO campaign_comments (campaign_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [campaignId, userId, content]);
    return result.rows[0];
  }
};

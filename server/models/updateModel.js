import { query } from '../config/db.js';

export const CampaignUpdate = {
  findByCampaignId: async (campaignId) => {
    const sql = `
      SELECT *
      FROM campaign_updates
      WHERE campaign_id = $1
      ORDER BY created_at DESC
    `;
    const result = await query(sql, [campaignId]);
    return result.rows;
  },

  create: async ({ campaignId, title, content }) => {
    const sql = `
      INSERT INTO campaign_updates (campaign_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [campaignId, title, content]);
    return result.rows[0];
  }
};

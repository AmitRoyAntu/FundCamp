import { query } from '../config/db.js';

export const Donation = {
  findByCampaignId: async (campaignId) => {
    const sql = `
      SELECT *
      FROM donations
      WHERE campaign_id = $1
      ORDER BY amount DESC, created_at DESC
      LIMIT 10
    `;
    const result = await query(sql, [campaignId]);
    return result.rows;
  }
};

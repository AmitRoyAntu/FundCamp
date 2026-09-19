import {pool} from '../config/db.js';

export const savedCampaignModel = {
  async saveCampaign(userId, campaignId) {
    const result = await pool.query(
      `INSERT INTO saved_campaigns (user_id, campaign_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, campaign_id) DO NOTHING
       RETURNING *`,
      [userId, campaignId]
    );

    return result.rows[0];
  },

  async unsaveCampaign(userId, campaignId) {
    const result = await pool.query(
      `DELETE FROM saved_campaigns
       WHERE user_id = $1 AND campaign_id = $2
       RETURNING *`,
      [userId, campaignId]
    );

    return result.rows[0];
  },

  async isCampaignSaved(userId, campaignId) {
    const result = await pool.query(
      `SELECT 1
       FROM saved_campaigns
       WHERE user_id = $1 AND campaign_id = $2`,
      [userId, campaignId]
    );

    return result.rows.length > 0;
  },

  async getSavedCampaigns(userId) {
  const result = await pool.query(
    `SELECT c.*,
            u.name as creator_name,
            COALESCE(c.department, u.department) as creator_department
     FROM campaigns c
     INNER JOIN saved_campaigns sc
       ON c.id = sc.campaign_id
     INNER JOIN users u
       ON c.creator_id = u.id
     WHERE sc.user_id = $1
     ORDER BY sc.created_at DESC`,
    [userId]
  );

  return result.rows;
}
};

import { query } from '../config/db.js';

export const Donation = {
  findByCampaignId: async (campaignId) => {
    const sql = `
      SELECT *
      FROM donations
      WHERE campaign_id = $1
      ORDER BY amount DESC, created_at DESC
      LIMIT 20
    `;
    const result = await query(sql, [campaignId]);
    return result.rows;
  },

  findByUserId: async (userId) => {
    const sql = `
      SELECT d.*, c.title as campaign_title, c.category as campaign_category, c.image as campaign_image,
             c.goal_amount, c.amount_raised, c.created_at as campaign_created_at,
             u.name as creator_name, u.department as creator_department
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      JOIN users u ON c.creator_id = u.id
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  },

  findByCreatorId: async (creatorId) => {
    const sql = `
      SELECT d.*, c.title as campaign_title, c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE c.creator_id = $1
      ORDER BY d.created_at DESC
      LIMIT 50
    `;
    const result = await query(sql, [creatorId]);
    return result.rows;
  },

  create: async ({ campaignId, userId, donorName, amount, paymentMethod }) => {
    const sql = `
      INSERT INTO donations (campaign_id, user_id, donor_name, amount, payment_method)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [
      campaignId,
      userId || null,
      donorName || 'Anonymous Backer',
      amount,
      paymentMethod || 'bKash'
    ]);
    return result.rows[0];
  }
};

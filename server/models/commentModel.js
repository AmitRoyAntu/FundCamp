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
  },

  delete: async (id) => {
    const sql = `DELETE FROM campaign_comments WHERE id = $1 RETURNING *`;
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  findByUserId: async (userId) => {
    const sql = `
      SELECT c.*, u.name as user_name, u.department as user_department, u.user_type,
             camp.title as campaign_title, camp.category as campaign_category
      FROM campaign_comments c
      JOIN users u ON c.user_id = u.id
      JOIN campaigns camp ON c.campaign_id = camp.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  },

  findAllForAdmin: async ({ search, campaignId, userId } = {}) => {
    let sql = `
      SELECT c.*, u.name as user_name, u.department as user_department, u.user_type,
             camp.title as campaign_title, camp.category as campaign_category
      FROM campaign_comments c
      JOIN users u ON c.user_id = u.id
      JOIN campaigns camp ON c.campaign_id = camp.id
    `;
    const conditions = [];
    const params = [];

    if (userId) {
      params.push(userId);
      conditions.push(`c.user_id = $${params.length}`);
    }
    if (campaignId) {
      params.push(campaignId);
      conditions.push(`c.campaign_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.content ILIKE $${params.length} OR u.name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },
};

import { query } from '../config/db.js';

export const Campaign = {
  findAll: async () => {
    const sql = `
      SELECT c.*, u.name as creator_name, u.department as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      ORDER BY c.created_at DESC
    `;
    const result = await query(sql);
    return result.rows;
  },

  findById: async (id) => {
    const sql = `
      SELECT c.*, u.name as creator_name, u.department as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  create: async ({ title, description, goalAmount, creatorId }) => {
    const sql = `
      INSERT INTO campaigns (title, description, goal_amount, creator_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [title, description, goalAmount, creatorId]);
    return result.rows[0];
  }
};

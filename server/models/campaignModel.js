import { query } from '../config/db.js';

export const Campaign = {
  findAll: async () => {
    const sql = `
      SELECT c.*, u.name as creator_name, COALESCE(c.department, u.department) as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      ORDER BY c.created_at DESC
    `;
    const result = await query(sql);
    return result.rows;
  },

  findById: async (id) => {
    const sql = `
      SELECT c.*, u.name as creator_name, COALESCE(c.department, u.department) as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  create: async ({ title, description, category, department, image, goalAmount, creatorId }) => {
    const sql = `
      INSERT INTO campaigns (title, description, category, department, image, goal_amount, creator_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(sql, [
      title,
      description,
      category || 'Education',
      department || 'University Department',
      image || null,
      goalAmount,
      creatorId
    ]);
    return result.rows[0];
  },

  donate: async ({ id, amount, donorName, paymentMethod }) => {
    const sqlUpdate = `
      UPDATE campaigns
      SET amount_raised = COALESCE(amount_raised, 0) + $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sqlUpdate, [amount, id]);

    // Record donation transaction log
    const sqlDonation = `
      INSERT INTO donations (campaign_id, donor_name, amount, payment_method)
      VALUES ($1, $2, $3, $4)
    `;
    await query(sqlDonation, [id, donorName || 'Anonymous Backer', amount, paymentMethod || 'bKash']);

    return result.rows[0];
  }
};

import { query } from '../config/db.js';

export const User = {
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const sql = 'SELECT id, name, email, department, user_type, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  create: async ({ name, email, password, department, userType }) => {
    const sql = `
      INSERT INTO users (name, email, password, department, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, department, user_type, created_at
    `;
    const result = await query(sql, [name, email, password, department, userType]);
    return result.rows[0];
  }
};

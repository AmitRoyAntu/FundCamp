import { query } from '../config/db.js';

export const User = {
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const sql = 'SELECT id, name, email, department, user_type, avatar, university_id, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  create: async ({ name, email, password, department, userType, avatar, universityId }) => {
    const sql = `
      INSERT INTO users (name, email, password, department, user_type, avatar, university_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, department, user_type, avatar, university_id, created_at
    `;
    const result = await query(sql, [
      name,
      email,
      password,
      department,
      userType,
      avatar || null,
      universityId || null
    ]);
    return result.rows[0];
  },

  update: async (id, { name, department, universityId, avatar }) => {
    const sql = `
      UPDATE users
      SET name = COALESCE($1, name),
          department = COALESCE($2, department),
          university_id = COALESCE($3, university_id),
          avatar = COALESCE($4, avatar)
      WHERE id = $5
      RETURNING id, name, email, department, user_type, avatar, university_id, created_at
    `;
    const result = await query(sql, [
      name || null,
      department || null,
      universityId || null,
      avatar || null,
      id
    ]);
    return result.rows[0];
  }
};

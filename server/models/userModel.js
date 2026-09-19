import { query } from '../config/db.js';

export const User = {
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const sql = 'SELECT id, name, email, department, user_type, status, avatar, university_id, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  findAllForAdmin: async ({ search, department, status } = {}) => {
    let sql = `
      SELECT u.id, u.name, u.email, u.department, u.user_type, 
             COALESCE(u.status, 'active') as status, 
             u.avatar, u.university_id, u.created_at,
             COUNT(c.id) as campaign_count
      FROM users u
      LEFT JOIN campaigns c ON c.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND COALESCE(u.status, 'active') = $${paramIndex++}`;
      params.push(status);
    }
    if (department && department !== 'All') {
      sql += ` AND u.department = $${paramIndex++}`;
      params.push(department);
    }
    if (search && search.trim()) {
      sql += ` AND (LOWER(u.name) LIKE $${paramIndex} OR LOWER(u.email) LIKE $${paramIndex} OR LOWER(COALESCE(u.university_id, '')) LIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${search.toLowerCase().trim()}%`);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  },

  updateStatus: async (id, status) => {
    const sql = `
      UPDATE users
      SET status = $1
      WHERE id = $2
      RETURNING id, name, email, department, user_type, status, avatar, university_id, created_at
    `;
    const result = await query(sql, [status, id]);
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

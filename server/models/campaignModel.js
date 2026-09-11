import { query } from '../config/db.js';

export const Campaign = {
  findAll: async (options = {}) => {
    // Public listing only shows approved campaigns unless specifically requested
    const whereClause = options.status
      ? `WHERE c.status = '${options.status}'`
      : `WHERE (c.status = 'approved' OR c.status IS NULL)`;

    const sql = `
      SELECT c.*, u.name as creator_name, COALESCE(c.department, u.department) as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;
    const result = await query(sql);
    return result.rows;
  },

  findAllForAdmin: async ({ status, category, department, search } = {}) => {
    let sql = `
      SELECT c.*, 
             u.name as creator_name, 
             u.email as creator_email, 
             u.user_type as creator_user_type,
             u.university_id as creator_university_id,
             COALESCE(c.department, u.department) as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }
    if (category && category !== 'All') {
      sql += ` AND c.category = $${paramIndex++}`;
      params.push(category);
    }
    if (department && department !== 'All') {
      sql += ` AND (c.department = $${paramIndex} OR u.department = $${paramIndex})`;
      paramIndex++;
      params.push(department);
    }
    if (search && search.trim()) {
      sql += ` AND (LOWER(c.title) LIKE $${paramIndex} OR LOWER(c.description) LIKE $${paramIndex} OR LOWER(u.name) LIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${search.toLowerCase().trim()}%`);
    }

    sql += ` ORDER BY CASE WHEN c.status = 'pending' THEN 0 ELSE 1 END, c.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  findById: async (id) => {
    const sql = `
      SELECT c.*, 
             u.name as creator_name, 
             u.email as creator_email,
             u.user_type as creator_user_type,
             u.university_id as creator_university_id,
             COALESCE(c.department, u.department) as creator_department
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  updateStatus: async (id, { status, adminFeedback, verifiedBy }) => {
    const verifiedAt = new Date().toISOString();
    const sql = `
      UPDATE campaigns
      SET status = $1,
          admin_feedback = $2,
          verified_at = $3,
          verified_by = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await query(sql, [status, adminFeedback || null, verifiedAt, verifiedBy || null, id]);
    return result.rows[0] || null;
  },

  delete: async (id) => {
    const sql = `
      DELETE FROM campaigns
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  create: async ({ title, description, category, department, image, goalAmount, tags, documents, creatorId }) => {
    const formattedTags = Array.isArray(tags)
      ? tags.map(t => String(t).replace(/^#/, '').trim()).filter(Boolean)
      : (typeof tags === 'string' ? tags.split(',').map(t => t.replace(/^#/, '').trim()).filter(Boolean) : []);

    const formattedDocs = Array.isArray(documents) ? JSON.stringify(documents) : '[]';

    const sql = `
      INSERT INTO campaigns (title, description, category, department, image, goal_amount, tags, creator_id, documents, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `;
    const result = await query(sql, [
      title,
      description,
      category || 'Education',
      department || 'University Department',
      image || null,
      goalAmount,
      formattedTags,
      creatorId,
      formattedDocs
    ]);
    return result.rows[0];
  },

  donate: async (arg1, arg2) => {
    let id, amount, donorName, paymentMethod, userId;
    if (typeof arg1 === 'object' && arg1 !== null) {
      ({ id, amount, donorName, paymentMethod, userId } = arg1);
    } else {
      id = arg1;
      amount = arg2;
    }

    const sqlUpdate = `
      UPDATE campaigns
      SET amount_raised = COALESCE(amount_raised, 0) + $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sqlUpdate, [amount, id]);

    // Record donation transaction log
    const sqlDonation = `
      INSERT INTO donations (campaign_id, user_id, donor_name, amount, payment_method)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await query(sqlDonation, [id, userId || null, donorName || 'Anonymous Backer', amount, paymentMethod || 'bKash']);

    return result.rows[0];
  }
};

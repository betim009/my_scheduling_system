const { pool } = require('../database/connection');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `
      SELECT id, name, username, email, password, role, phone, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.execute(
    `
      SELECT id, name, username, email, password, role, phone, created_at, updated_at
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username]
  );

  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `
      SELECT id, name, username, email, password, role, phone, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function createUser({ name, username, email, password, role, phone }) {
  const [result] = await pool.execute(
    `
      INSERT INTO users (name, username, email, password, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, username, email, password, role, phone]
  );

  return result.insertId;
}

async function updateById(id, { name, username, email, password, phone }) {
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name);
  }

  if (username !== undefined) {
    fields.push('username = ?');
    params.push(username);
  }

  if (email !== undefined) {
    fields.push('email = ?');
    params.push(email);
  }

  if (password !== undefined) {
    fields.push('password = ?');
    params.push(password);
  }

  if (phone !== undefined) {
    fields.push('phone = ?');
    params.push(phone);
  }

  if (!fields.length) {
    return false;
  }

  const [result] = await pool.execute(
    `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    [...params, id]
  );

  return result.affectedRows > 0;
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.role !== undefined) {
    conditions.push('role = ?');
    params.push(filters.role);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `
      SELECT id, name, username, email, role, phone, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY name ASC, id ASC
    `,
    params
  );

  return rows;
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUser,
  updateById,
  findAll,
};

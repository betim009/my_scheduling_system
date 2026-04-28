const { pool } = require('../database/connection');

async function createRule({ userId, weekday, startTime, endTime, slotDurationMinutes, isActive }) {
  const [result] = await pool.execute(
    `
      INSERT INTO availability_rules (
        user_id,
        weekday,
        start_time,
        end_time,
        slot_duration_minutes,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, weekday, startTime, endTime, slotDurationMinutes, isActive]
  );

  return result.insertId;
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push('user_id = ?');
    params.push(filters.userId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        weekday,
        start_time,
        end_time,
        slot_duration_minutes,
        is_active,
        created_at,
        updated_at
      FROM availability_rules
      ${whereClause}
      ORDER BY user_id ASC, weekday ASC, start_time ASC
    `,
    params
  );

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        weekday,
        start_time,
        end_time,
        slot_duration_minutes,
        is_active,
        created_at,
        updated_at
      FROM availability_rules
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function updateById(id, { userId, weekday, startTime, endTime, slotDurationMinutes, isActive }) {
  const [result] = await pool.execute(
    `
      UPDATE availability_rules
      SET
        user_id = ?,
        weekday = ?,
        start_time = ?,
        end_time = ?,
        slot_duration_minutes = ?,
        is_active = ?
      WHERE id = ?
    `,
    [userId, weekday, startTime, endTime, slotDurationMinutes, isActive, id]
  );

  return result.affectedRows > 0;
}

async function deleteById(id) {
  const [result] = await pool.execute(
    `
      DELETE FROM availability_rules
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}

async function findActiveByUser(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        weekday,
        start_time,
        end_time,
        slot_duration_minutes,
        is_active,
        created_at,
        updated_at
      FROM availability_rules
      WHERE user_id = ? AND is_active = 1
      ORDER BY weekday ASC, start_time ASC
    `,
    [userId]
  );

  return rows;
}

module.exports = {
  createRule,
  findAll,
  findById,
  updateById,
  deleteById,
  findActiveByUser,
};

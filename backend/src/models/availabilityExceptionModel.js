const { pool } = require('../database/connection');

async function createException({ userId, exceptionDate, type, startTime, endTime, reason }) {
  const [result] = await pool.execute(
    `
      INSERT INTO availability_exceptions (
        user_id,
        exception_date,
        type,
        start_time,
        end_time,
        reason
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, exceptionDate, type, startTime, endTime, reason]
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

  if (filters.startDate && filters.endDate) {
    conditions.push('exception_date BETWEEN ? AND ?');
    params.push(filters.startDate, filters.endDate);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        exception_date,
        type,
        start_time,
        end_time,
        reason,
        created_at,
        updated_at
      FROM availability_exceptions
      ${whereClause}
      ORDER BY exception_date ASC, start_time ASC, id ASC
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
        exception_date,
        type,
        start_time,
        end_time,
        reason,
        created_at,
        updated_at
      FROM availability_exceptions
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function updateById(id, { userId, exceptionDate, type, startTime, endTime, reason }) {
  const [result] = await pool.execute(
    `
      UPDATE availability_exceptions
      SET
        user_id = ?,
        exception_date = ?,
        type = ?,
        start_time = ?,
        end_time = ?,
        reason = ?
      WHERE id = ?
    `,
    [userId, exceptionDate, type, startTime, endTime, reason, id]
  );

  return result.affectedRows > 0;
}

async function deleteById(id) {
  const [result] = await pool.execute(
    `
      DELETE FROM availability_exceptions
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}

async function findByUserAndDateRange(userId, startDate, endDate) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        exception_date,
        type,
        start_time,
        end_time,
        reason,
        created_at,
        updated_at
      FROM availability_exceptions
      WHERE user_id = ? AND exception_date BETWEEN ? AND ?
      ORDER BY exception_date ASC, start_time ASC, id ASC
    `,
    [userId, startDate, endDate]
  );

  return rows;
}

module.exports = {
  createException,
  findAll,
  findById,
  updateById,
  deleteById,
  findByUserAndDateRange,
};

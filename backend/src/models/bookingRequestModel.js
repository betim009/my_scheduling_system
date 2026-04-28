const { pool } = require('../database/connection');

function buildFilters(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.studentId) {
    conditions.push('br.student_id = ?');
    params.push(filters.studentId);
  }

  if (filters.teacherId) {
    conditions.push('br.teacher_id = ?');
    params.push(filters.teacherId);
  }

  if (filters.status) {
    conditions.push('br.status = ?');
    params.push(filters.status);
  }

  if (filters.requestedDate) {
    conditions.push('br.requested_date = ?');
    params.push(filters.requestedDate);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

function getSelectSql(whereClause = '', suffix = '') {
  return `
    SELECT
      br.id,
      br.student_id,
      br.teacher_id,
      br.requested_date,
      br.start_time,
      br.end_time,
      br.status,
      br.student_message,
      br.admin_message,
      br.created_at,
      br.updated_at,
      student.name AS student_name,
      student.email AS student_email,
      teacher.name AS teacher_name,
      teacher.email AS teacher_email,
      booking.id AS booking_id,
      booking.status AS booking_status
    FROM booking_requests br
    INNER JOIN users student ON student.id = br.student_id
    INNER JOIN users teacher ON teacher.id = br.teacher_id
    LEFT JOIN bookings booking ON booking.booking_request_id = br.id
    ${whereClause}
    ${suffix}
  `;
}

async function createBookingRequest(executor, data) {
  const activeExecutor = executor || pool;

  const [result] = await activeExecutor.execute(
    `
      INSERT INTO booking_requests (
        student_id,
        teacher_id,
        requested_date,
        start_time,
        end_time,
        status,
        student_message,
        admin_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.studentId,
      data.teacherId,
      data.requestedDate,
      data.startTime,
      data.endTime,
      data.status,
      data.studentMessage,
      data.adminMessage,
    ]
  );

  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.execute(
    getSelectSql('WHERE br.id = ?', 'LIMIT 1'),
    [id]
  );

  return rows[0] || null;
}

async function findByIdForUpdate(executor, id) {
  const activeExecutor = executor || pool;

  const [rows] = await activeExecutor.execute(
    getSelectSql('WHERE br.id = ?', 'LIMIT 1 FOR UPDATE'),
    [id]
  );

  return rows[0] || null;
}

async function findPendingBySlot(executor, { teacherId, requestedDate, startTime, endTime }) {
  const activeExecutor = executor || pool;

  const [rows] = await activeExecutor.execute(
    getSelectSql(
      `
        WHERE br.teacher_id = ?
          AND br.requested_date = ?
          AND br.start_time = ?
          AND br.end_time = ?
          AND br.status = 'pending'
      `,
      'LIMIT 1 FOR UPDATE'
    ),
    [teacherId, requestedDate, startTime, endTime]
  );

  return rows[0] || null;
}

async function updateById(executor, id, updates) {
  const activeExecutor = executor || pool;
  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'adminMessage')) {
    if (updates.adminMessage !== undefined) {
      fields.push('admin_message = ?');
      params.push(updates.adminMessage);
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'studentMessage')) {
    if (updates.studentMessage !== undefined) {
      fields.push('student_message = ?');
      params.push(updates.studentMessage);
    }
  }

  if (!fields.length) {
    return false;
  }

  const [result] = await activeExecutor.execute(
    `
      UPDATE booking_requests
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    [...params, id]
  );

  return result.affectedRows > 0;
}

async function findAll(filters = {}) {
  const { whereClause, params } = buildFilters(filters);
  const [rows] = await pool.execute(
    getSelectSql(whereClause, 'ORDER BY br.created_at DESC, br.id DESC'),
    params
  );

  return rows;
}

module.exports = {
  createBookingRequest,
  findById,
  findByIdForUpdate,
  findPendingBySlot,
  updateById,
  findAll,
};

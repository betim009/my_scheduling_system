const { pool } = require('../database/connection');

function buildFilters(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.studentId) {
    conditions.push('b.student_id = ?');
    params.push(filters.studentId);
  }

  if (filters.teacherId) {
    conditions.push('b.teacher_id = ?');
    params.push(filters.teacherId);
  }

  if (filters.bookingDate) {
    conditions.push('b.booking_date = ?');
    params.push(filters.bookingDate);
  }

  if (filters.status) {
    conditions.push('b.status = ?');
    params.push(filters.status);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

function getSelectSql(whereClause = '', suffix = '') {
  return `
    SELECT
      b.id,
      b.booking_request_id,
      b.student_id,
      b.teacher_id,
      b.subscription_id,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      b.notes,
      b.created_at,
      b.updated_at,
      student.name AS student_name,
      student.email AS student_email,
      teacher.name AS teacher_name,
      teacher.email AS teacher_email,
      subscription.plan_id,
      subscription.remaining_classes,
      subscription.status AS subscription_status,
      plan.name AS plan_name
    FROM bookings b
    INNER JOIN users student ON student.id = b.student_id
    INNER JOIN users teacher ON teacher.id = b.teacher_id
    LEFT JOIN subscriptions subscription ON subscription.id = b.subscription_id
    LEFT JOIN plans plan ON plan.id = subscription.plan_id
    ${whereClause}
    ${suffix}
  `;
}

async function createBooking(executor, data) {
  const activeExecutor = executor || pool;

  const [result] = await activeExecutor.execute(
    `
      INSERT INTO bookings (
        booking_request_id,
        student_id,
        teacher_id,
        subscription_id,
        booking_date,
        start_time,
        end_time,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.bookingRequestId,
      data.studentId,
      data.teacherId,
      data.subscriptionId,
      data.bookingDate,
      data.startTime,
      data.endTime,
      data.status,
      data.notes,
    ]
  );

  return result.insertId;
}

async function findByIdForUpdate(executor, id) {
  const activeExecutor = executor || pool;

  const [rows] = await activeExecutor.execute(
    `
      SELECT
        id,
        booking_request_id,
        student_id,
        teacher_id,
        subscription_id,
        booking_date,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at
      FROM bookings
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    getSelectSql('WHERE b.id = ?', 'LIMIT 1'),
    [id]
  );

  return rows[0] || null;
}

async function findAll(filters = {}) {
  const { whereClause, params } = buildFilters(filters);
  const [rows] = await pool.execute(
    getSelectSql(whereClause, 'ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC'),
    params
  );

  return rows;
}

async function countByTeacherAndDate(executor, { teacherId, bookingDate, statuses = [] }) {
  const activeExecutor = executor || pool;
  const params = [teacherId, bookingDate];
  let statusesClause = '';

  if (statuses.length) {
    statusesClause = `AND status IN (${statuses.map(() => '?').join(', ')})`;
    params.push(...statuses);
  }

  const [rows] = await activeExecutor.execute(
    `
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE teacher_id = ?
        AND booking_date = ?
        ${statusesClause}
    `,
    params
  );

  return Number(rows[0]?.total || 0);
}

async function updateById(executor, id, updates) {
  const activeExecutor = executor || pool;
  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(updates, 'bookingRequestId')) {
    fields.push('booking_request_id = ?');
    params.push(updates.bookingRequestId);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'studentId')) {
    fields.push('student_id = ?');
    params.push(updates.studentId);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'teacherId')) {
    fields.push('teacher_id = ?');
    params.push(updates.teacherId);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'subscriptionId')) {
    fields.push('subscription_id = ?');
    params.push(updates.subscriptionId);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'bookingDate')) {
    fields.push('booking_date = ?');
    params.push(updates.bookingDate);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'startTime')) {
    fields.push('start_time = ?');
    params.push(updates.startTime);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'endTime')) {
    fields.push('end_time = ?');
    params.push(updates.endTime);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'notes')) {
    fields.push('notes = ?');
    params.push(updates.notes);
  }

  if (!fields.length) {
    return false;
  }

  const [result] = await activeExecutor.execute(
    `
      UPDATE bookings
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    [...params, id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  countByTeacherAndDate,
  createBooking,
  findByIdForUpdate,
  findById,
  findAll,
  updateById,
};

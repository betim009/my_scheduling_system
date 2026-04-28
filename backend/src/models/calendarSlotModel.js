const { pool } = require('../database/connection');

function buildStatusFilters(statuses = []) {
  if (!Array.isArray(statuses) || !statuses.length) {
    return {
      clause: '',
      params: [],
    };
  }

  const placeholders = statuses.map(() => '?').join(', ');

  return {
    clause: ` AND status IN (${placeholders})`,
    params: statuses,
  };
}

async function deleteByUserAndDateRange(executor, { userId, startDate, endDate }) {
  const activeExecutor = executor || pool;

  const [result] = await activeExecutor.execute(
    `
      DELETE FROM calendar_slots
      WHERE user_id = ?
        AND slot_date BETWEEN ? AND ?
        AND booking_request_id IS NULL
        AND booking_id IS NULL
    `,
    [userId, startDate, endDate]
  );

  return result.affectedRows;
}

async function findByUnique(executor, { userId, slotDate, startTime, endTime, forUpdate = false }) {
  const activeExecutor = executor || pool;
  const lockClause = forUpdate ? 'FOR UPDATE' : '';

  const [rows] = await activeExecutor.execute(
    `
      SELECT
        id,
        user_id,
        slot_date,
        start_time,
        end_time,
        status,
        booking_request_id,
        booking_id,
        source,
        created_at,
        updated_at
      FROM calendar_slots
      WHERE user_id = ?
        AND slot_date = ?
        AND start_time = ?
        AND end_time = ?
      LIMIT 1
      ${lockClause}
    `,
    [userId, slotDate, startTime, endTime]
  );

  return rows[0] || null;
}

async function insertMany(executor, slots) {
  if (!slots.length) {
    return 0;
  }

  const activeExecutor = executor || pool;
  const values = slots.map((slot) => [
    slot.user_id,
    slot.slot_date,
    slot.start_time,
    slot.end_time,
    slot.status,
    slot.source,
  ]);

  const [result] = await activeExecutor.query(
    `
      INSERT INTO calendar_slots (
        user_id,
        slot_date,
        start_time,
        end_time,
        status,
        source
      )
      VALUES ?
    `,
    [values]
  );

  return result.affectedRows;
}

async function updateById(executor, id, updates) {
  const activeExecutor = executor || pool;
  const fields = [];
  const params = [];

  if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'bookingRequestId')) {
    fields.push('booking_request_id = ?');
    params.push(updates.bookingRequestId);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'bookingId')) {
    fields.push('booking_id = ?');
    params.push(updates.bookingId);
  }

  if (!fields.length) {
    return false;
  }

  const [result] = await activeExecutor.execute(
    `
      UPDATE calendar_slots
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    [...params, id]
  );

  return result.affectedRows > 0;
}

async function findByDateRange({ userId, startDate, endDate, statuses = [] }, executor = null) {
  const activeExecutor = executor || pool;
  const statusFilters = buildStatusFilters(statuses);

  const [rows] = await activeExecutor.execute(
    `
      SELECT
        id,
        user_id,
        slot_date,
        start_time,
        end_time,
        status,
        booking_request_id,
        booking_id,
        source,
        created_at,
        updated_at
      FROM calendar_slots
      WHERE user_id = ? AND slot_date BETWEEN ? AND ?${statusFilters.clause}
      ORDER BY slot_date ASC, start_time ASC
    `,
    [userId, startDate, endDate, ...statusFilters.params]
  );

  return rows;
}

async function findByDate({ userId, date, statuses = [] }, executor = null) {
  const activeExecutor = executor || pool;
  const statusFilters = buildStatusFilters(statuses);

  const [rows] = await activeExecutor.execute(
    `
      SELECT
        id,
        user_id,
        slot_date,
        start_time,
        end_time,
        status,
        booking_request_id,
        booking_id,
        source,
        created_at,
        updated_at
      FROM calendar_slots
      WHERE user_id = ? AND slot_date = ?${statusFilters.clause}
      ORDER BY start_time ASC
    `,
    [userId, date, ...statusFilters.params]
  );

  return rows;
}

module.exports = {
  deleteByUserAndDateRange,
  findByUnique,
  insertMany,
  updateById,
  findByDateRange,
  findByDate,
};

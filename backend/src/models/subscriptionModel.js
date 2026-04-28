const { pool } = require('../database/connection');

function getSelectSql(whereClause = '', suffix = '') {
  return `
    SELECT
      s.id,
      s.student_id,
      s.plan_id,
      s.start_date,
      s.end_date,
      s.total_classes,
      s.remaining_classes,
      s.status,
      s.created_at,
      s.updated_at,
      u.name AS student_name,
      u.email AS student_email,
      u.username AS student_username,
      p.name AS plan_name,
      p.classes_per_week,
      p.price,
      p.price_per_class,
      p.is_active AS plan_is_active
    FROM subscriptions s
    INNER JOIN users u ON u.id = s.student_id
    INNER JOIN plans p ON p.id = s.plan_id
    ${whereClause}
    ${suffix}
  `;
}

function buildFilters(filters) {
  const conditions = [];
  const params = [];

  if (filters.studentId !== undefined) {
    conditions.push('s.student_id = ?');
    params.push(filters.studentId);
  }

  if (filters.planId !== undefined) {
    conditions.push('s.plan_id = ?');
    params.push(filters.planId);
  }

  if (filters.status !== undefined) {
    conditions.push('s.status = ?');
    params.push(filters.status);
  }

  return {
    params,
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
  };
}

async function findAll(filters = {}) {
  const { whereClause, params } = buildFilters(filters);
  const [rows] = await pool.execute(getSelectSql(whereClause, 'ORDER BY s.start_date DESC, s.id DESC'), params);

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(getSelectSql('WHERE s.id = ?', 'LIMIT 1'), [id]);

  return rows[0] || null;
}

async function findApplicableByStudentAndDate(executor, { studentId, bookingDate }) {
  const activeExecutor = executor || pool;
  const [rows] = await activeExecutor.execute(
    getSelectSql(
      `
        WHERE s.student_id = ?
          AND s.status = 'active'
          AND s.remaining_classes > 0
          AND s.start_date <= ?
          AND s.end_date >= ?
      `,
      'ORDER BY s.end_date ASC, s.created_at ASC, s.id ASC LIMIT 1 FOR UPDATE'
    ),
    [studentId, bookingDate, bookingDate]
  );

  return rows[0] || null;
}

async function createSubscription({
  studentId,
  planId,
  startDate,
  endDate,
  totalClasses,
  remainingClasses,
  status,
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO subscriptions (
        student_id,
        plan_id,
        start_date,
        end_date,
        total_classes,
        remaining_classes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [studentId, planId, startDate, endDate, totalClasses, remainingClasses, status]
  );

  return result.insertId;
}

async function createSubscriptionWithExecutor(executor, {
  studentId,
  planId,
  startDate,
  endDate,
  totalClasses,
  remainingClasses,
  status,
}) {
  const activeExecutor = executor || pool;

  const [result] = await activeExecutor.execute(
    `
      INSERT INTO subscriptions (
        student_id,
        plan_id,
        start_date,
        end_date,
        total_classes,
        remaining_classes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [studentId, planId, startDate, endDate, totalClasses, remainingClasses, status]
  );

  return result.insertId;
}

async function updateSubscription(id, { startDate, endDate, status }) {
  await pool.execute(
    `
      UPDATE subscriptions
      SET
        start_date = ?,
        end_date = ?,
        status = ?
      WHERE id = ?
    `,
    [startDate, endDate, status, id]
  );
}

async function updateStatus(id, status) {
  await pool.execute(
    `
      UPDATE subscriptions
      SET status = ?
      WHERE id = ?
    `,
    [status, id]
  );
}

async function updateRemainingClasses(id, remainingClasses) {
  await pool.execute(
    `
      UPDATE subscriptions
      SET remaining_classes = ?
      WHERE id = ?
    `,
    [remainingClasses, id]
  );
}

async function updateStatusById(executor, id, status) {
  const activeExecutor = executor || pool;

  await activeExecutor.execute(
    `
      UPDATE subscriptions
      SET status = ?
      WHERE id = ?
    `,
    [status, id]
  );
}

async function updateRemainingClassesById(executor, id, remainingClasses) {
  const activeExecutor = executor || pool;

  await activeExecutor.execute(
    `
      UPDATE subscriptions
      SET remaining_classes = ?
      WHERE id = ?
    `,
    [remainingClasses, id]
  );
}

async function findSummaryByStudentId(studentId) {
  const [summaryRows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS active_subscriptions_count,
        COALESCE(SUM(remaining_classes), 0) AS total_remaining_classes
      FROM subscriptions
      WHERE student_id = ?
        AND status = 'active'
    `,
    [studentId]
  );

  const [currentRows] = await pool.execute(
    `
      SELECT
        s.id,
        s.student_id,
        s.plan_id,
        s.start_date,
        s.end_date,
        s.total_classes,
        s.remaining_classes,
        s.status,
        s.created_at,
        s.updated_at,
        p.name AS plan_name,
        p.classes_per_week,
        p.price,
        p.price_per_class,
        p.is_active AS plan_is_active
      FROM subscriptions s
      INNER JOIN plans p ON p.id = s.plan_id
      WHERE s.student_id = ?
        AND s.status = 'active'
      ORDER BY s.start_date DESC, s.end_date DESC, s.id DESC
      LIMIT 1
    `,
    [studentId]
  );

  return {
    active_subscriptions_count: Number(summaryRows[0]?.active_subscriptions_count || 0),
    total_remaining_classes: Number(summaryRows[0]?.total_remaining_classes || 0),
    current_subscription: currentRows[0] || null,
  };
}

module.exports = {
  findAll,
  findById,
  findApplicableByStudentAndDate,
  createSubscription,
  createSubscriptionWithExecutor,
  updateSubscription,
  updateStatus,
  updateRemainingClasses,
  updateStatusById,
  updateRemainingClassesById,
  findSummaryByStudentId,
};

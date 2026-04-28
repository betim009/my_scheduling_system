const { pool } = require('../database/connection');

function buildFilters(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.studentId !== undefined) {
    conditions.push('pr.student_id = ?');
    params.push(filters.studentId);
  }

  if (filters.planId !== undefined) {
    conditions.push('pr.plan_id = ?');
    params.push(filters.planId);
  }

  if (filters.status !== undefined) {
    conditions.push('pr.status = ?');
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
      pr.id,
      pr.student_id,
      pr.plan_id,
      pr.status,
      pr.created_at,
      pr.updated_at,
      student.name AS student_name,
      student.email AS student_email,
      plan.name AS plan_name,
      plan.total_classes,
      plan.classes_per_week,
      plan.price,
      plan.price_per_class,
      plan.is_active AS plan_is_active
    FROM plan_requests pr
    INNER JOIN users student ON student.id = pr.student_id
    INNER JOIN plans plan ON plan.id = pr.plan_id
    ${whereClause}
    ${suffix}
  `;
}

async function createPlanRequest(executor, data) {
  const activeExecutor = executor || pool;

  const [result] = await activeExecutor.execute(
    `
      INSERT INTO plan_requests (
        student_id,
        plan_id,
        status
      )
      VALUES (?, ?, ?)
    `,
    [data.studentId, data.planId, data.status]
  );

  return result.insertId;
}

async function findAll(filters = {}) {
  const { whereClause, params } = buildFilters(filters);
  const [rows] = await pool.execute(
    getSelectSql(whereClause, 'ORDER BY pr.created_at DESC, pr.id DESC'),
    params
  );

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    getSelectSql('WHERE pr.id = ?', 'LIMIT 1'),
    [id]
  );

  return rows[0] || null;
}

async function findByIdForUpdate(executor, id) {
  const activeExecutor = executor || pool;
  const [rows] = await activeExecutor.execute(
    getSelectSql('WHERE pr.id = ?', 'LIMIT 1 FOR UPDATE'),
    [id]
  );

  return rows[0] || null;
}

async function findPendingByStudentAndPlan(executor, { studentId, planId }) {
  const activeExecutor = executor || pool;
  const [rows] = await activeExecutor.execute(
    getSelectSql(
      `
        WHERE pr.student_id = ?
          AND pr.plan_id = ?
          AND pr.status = 'pending'
      `,
      'LIMIT 1 FOR UPDATE'
    ),
    [studentId, planId]
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

  if (!fields.length) {
    return false;
  }

  const [result] = await activeExecutor.execute(
    `
      UPDATE plan_requests
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    [...params, id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  createPlanRequest,
  findAll,
  findById,
  findByIdForUpdate,
  findPendingByStudentAndPlan,
  updateById,
};

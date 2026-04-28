const { pool } = require('../database/connection');

async function findAll({ onlyActive = false } = {}) {
  let query = `
    SELECT id, name, total_classes, classes_per_week, price, price_per_class, is_active, created_at, updated_at
    FROM plans
  `;
  const params = [];

  if (onlyActive) {
    query += ' WHERE is_active = TRUE';
  }

  query += ' ORDER BY total_classes ASC, id ASC';

  const [rows] = await pool.execute(query, params);

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `
      SELECT id, name, total_classes, classes_per_week, price, price_per_class, is_active, created_at, updated_at
      FROM plans
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function createPlan({ name, totalClasses, classesPerWeek, price, pricePerClass, isActive = true }) {
  const [result] = await pool.execute(
    `
      INSERT INTO plans (name, total_classes, classes_per_week, price, price_per_class, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, totalClasses, classesPerWeek, price, pricePerClass, isActive]
  );

  return result.insertId;
}

async function updatePlan(id, { name, totalClasses, classesPerWeek, price, pricePerClass }) {
  await pool.execute(
    `
      UPDATE plans
      SET
        name = ?,
        total_classes = ?,
        classes_per_week = ?,
        price = ?,
        price_per_class = ?
      WHERE id = ?
    `,
    [name, totalClasses, classesPerWeek, price, pricePerClass, id]
  );
}

async function updateActiveStatus(id, isActive) {
  await pool.execute(
    `
      UPDATE plans
      SET is_active = ?
      WHERE id = ?
    `,
    [isActive, id]
  );
}

module.exports = {
  findAll,
  findById,
  createPlan,
  updatePlan,
  updateActiveStatus,
};

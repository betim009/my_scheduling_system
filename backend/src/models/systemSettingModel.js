const { pool } = require('../database/connection');

async function findAll() {
  const [rows] = await pool.execute(
    `
      SELECT id, setting_key, setting_value, value_type, created_at, updated_at
      FROM system_settings
      ORDER BY setting_key ASC
    `
  );

  return rows;
}

async function findByKey(settingKey) {
  const [rows] = await pool.execute(
    `
      SELECT id, setting_key, setting_value, value_type, created_at, updated_at
      FROM system_settings
      WHERE setting_key = ?
      LIMIT 1
    `,
    [settingKey]
  );

  return rows[0] || null;
}

async function upsertSetting({ settingKey, settingValue, valueType }) {
  await pool.execute(
    `
      INSERT INTO system_settings (setting_key, setting_value, value_type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        value_type = VALUES(value_type)
    `,
    [settingKey, settingValue, valueType]
  );
}

async function upsertMany(settings) {
  if (!settings.length) {
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const setting of settings) {
      await connection.execute(
        `
          INSERT INTO system_settings (setting_key, setting_value, value_type)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value),
            value_type = VALUES(value_type)
        `,
        [setting.settingKey, setting.settingValue, setting.valueType]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findByKey,
  upsertSetting,
  upsertMany,
};

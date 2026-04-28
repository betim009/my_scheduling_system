const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

const { database } = require('../config/env');

function getDatabaseName() {
  if (!/^[A-Za-z0-9_]+$/.test(database.database)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores.');
  }

  return database.database;
}

async function ensurePlansActiveStructure(connection, databaseName) {
  const [columns] = await connection.execute(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = 'plans'
        AND column_name = 'is_active'
    `,
    [databaseName]
  );

  if (Number(columns[0]?.total || 0) === 0) {
    await connection.query(
      `
        ALTER TABLE plans
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
        AFTER price_per_class
      `
    );
  }

  const [indexes] = await connection.execute(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.statistics
      WHERE table_schema = ?
        AND table_name = 'plans'
        AND index_name = 'idx_plans_is_active'
    `,
    [databaseName]
  );

  if (Number(indexes[0]?.total || 0) === 0) {
    await connection.query('ALTER TABLE plans ADD INDEX idx_plans_is_active (is_active)');
  }
}

async function runSchema() {
  const databaseName = getDatabaseName();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  const adminConnection = await mysql.createConnection({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
  });

  try {
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await adminConnection.end();
  }

  const schemaConnection = await mysql.createConnection({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
    database: databaseName,
    multipleStatements: true,
  });

  try {
    await schemaConnection.query(schemaSql);
    await ensurePlansActiveStructure(schemaConnection, databaseName);
    console.log(`Schema applied successfully to database "${databaseName}".`);
  } finally {
    await schemaConnection.end();
  }
}

runSchema().catch((error) => {
  console.error(`Failed to apply schema: ${error.message}`);
  process.exit(1);
});

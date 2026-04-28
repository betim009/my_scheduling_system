const mysql = require('mysql2/promise');

const { database } = require('../config/env');

function getDatabaseName() {
  if (!/^[A-Za-z0-9_]+$/.test(database.database)) {
    throw new Error('DB_NAME must contain only letters, numbers, and underscores.');
  }

  return database.database;
}

async function dropDatabase() {
  const databaseName = getDatabaseName();

  const connection = await mysql.createConnection({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    console.log(`Database "${databaseName}" dropped successfully.`);
  } finally {
    await connection.end();
  }
}

dropDatabase().catch((error) => {
  console.error(`Failed to drop database: ${error.message}`);
  process.exit(1);
});

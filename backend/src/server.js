const app = require('./app');
const { port, database } = require('./config/env');
const { testDatabaseConnection } = require('./database/connection');

async function startServer() {
  const databaseTarget = `${database.host}:${database.port}/${database.database}`;

  try {
    await testDatabaseConnection();
    console.log(`MySQL connected successfully at ${databaseTarget}.`);
  } catch (error) {
    console.error(`MySQL connection failed at ${databaseTarget}: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();

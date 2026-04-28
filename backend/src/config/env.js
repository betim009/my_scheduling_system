const dotenv = require('dotenv');

dotenv.config({ quiet: true });

module.exports = {
  port: Number(process.env.PORT) || 3333,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_agendamento',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  defaultAdmin: {
    name: process.env.DEFAULT_ADMIN_NAME || 'Administrador',
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@sistema.local',
    password: process.env.DEFAULT_ADMIN_PASSWORD || '123456',
    phone: process.env.DEFAULT_ADMIN_PHONE || null,
  },
};

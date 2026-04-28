const { pool } = require('./connection');
const bcrypt = require('bcryptjs');
const { defaultAdmin } = require('../config/env');
const { systemSettingsCatalog } = require('../config/systemSettingsCatalog');
const systemSettingModel = require('../models/systemSettingModel');
const userModel = require('../models/userModel');
const {
  normalizeValueByType,
  serializeValueByType,
} = require('../services/systemSettingService');

const PASSWORD_SALT_ROUNDS = 10;

async function runSystemSettingsSeed() {
  for (const setting of systemSettingsCatalog) {
    const normalizedValue = normalizeValueByType(
      setting.default_value,
      setting.value_type,
      setting.setting_key
    );

    await systemSettingModel.upsertSetting({
      settingKey: setting.setting_key,
      settingValue: serializeValueByType(normalizedValue, setting.value_type),
      valueType: setting.value_type,
    });
  }

  console.log(
    `System settings seed applied successfully with ${systemSettingsCatalog.length} settings.`
  );
}

async function ensureDefaultAdminUser() {
  const [existingByEmail, existingByUsername] = await Promise.all([
    userModel.findByEmail(defaultAdmin.email),
    userModel.findByUsername(defaultAdmin.username),
  ]);

  const existingAdmin = existingByEmail || existingByUsername;

  if (existingAdmin) {
    console.log(
      `Default admin already exists: email=${existingAdmin.email} username=${existingAdmin.username}.`
    );
    return;
  }

  const password = await bcrypt.hash(defaultAdmin.password, PASSWORD_SALT_ROUNDS);

  await userModel.createUser({
    name: defaultAdmin.name,
    username: defaultAdmin.username,
    email: defaultAdmin.email,
    password,
    role: 'admin',
    phone: defaultAdmin.phone,
  });

  console.log(
    `Default admin created successfully: email=${defaultAdmin.email} username=${defaultAdmin.username}.`
  );
}

async function runSeed() {
  await runSystemSettingsSeed();
  await ensureDefaultAdminUser();
}

runSeed().catch((error) => {
  console.error(`Failed to seed system settings: ${error.message}`);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

const { systemSettingsCatalogMap } = require('../config/systemSettingsCatalog');
const systemSettingModel = require('../models/systemSettingModel');
const AppError = require('../utils/AppError');

function parseValueByType(value, valueType) {
  if (valueType === 'number') {
    return Number(value);
  }

  if (valueType === 'boolean') {
    return value === 'true' || value === '1' || value === 1 || value === true;
  }

  if (valueType === 'json') {
    try {
      return JSON.parse(value || 'null');
    } catch {
      return null;
    }
  }

  return value ?? '';
}

async function getSystemSetting(key, options = {}) {
  const { fallback, useCatalogDefault = true, throwIfMissing = false } = options;
  const definition = systemSettingsCatalogMap.get(key) || null;
  const row = await systemSettingModel.findByKey(key);

  if (row) {
    return parseValueByType(row.setting_value, row.value_type);
  }

  if (fallback !== undefined) {
    return fallback;
  }

  if (definition && useCatalogDefault) {
    return definition.default_value;
  }

  if (throwIfMissing) {
    throw new AppError('Configuração não encontrada.', 404);
  }

  return null;
}

async function getSystemSettings(keys, options = {}) {
  const values = await Promise.all(
    keys.map(async (key) => [key, await getSystemSetting(key, options)])
  );

  return Object.fromEntries(values);
}

function sanitizePhoneNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function renderTemplate(template, data = {}) {
  const source = String(template || '');

  return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, token) => {
    const value = data[token];

    return value === undefined || value === null ? '' : String(value);
  });
}

module.exports = {
  getSystemSetting,
  getSystemSettings,
  parseValueByType,
  sanitizePhoneNumber,
  renderTemplate,
};

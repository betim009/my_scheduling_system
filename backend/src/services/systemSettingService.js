const { systemSettingsCatalogMap } = require('../config/systemSettingsCatalog');
const systemSettingModel = require('../models/systemSettingModel');
const { getSystemSettings } = require('./systemSettingsRuntimeService');
const AppError = require('../utils/AppError');

const ALLOWED_VALUE_TYPES = ['string', 'number', 'boolean', 'json'];

function ensureAdminRequester(currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Apenas admins podem executar esta operação.', 403);
  }
}

function getSettingDefinition(settingKey) {
  const setting = systemSettingsCatalogMap.get(settingKey);

  if (!setting) {
    throw new AppError('Configuração não encontrada.', 404);
  }

  return setting;
}

function parseBooleanValue(value, fieldName = 'value') {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false;
  }

  throw new AppError(`O campo ${fieldName} deve ser um boolean válido.`, 400);
}

function parseNumberValue(value, fieldName = 'value') {
  if (value === '' || value === null || value === undefined) {
    throw new AppError(`O campo ${fieldName} é obrigatório.`, 400);
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new AppError(`O campo ${fieldName} deve ser um número válido.`, 400);
  }

  return parsedValue;
}

function parseJsonValue(value, fieldName = 'value') {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      throw new AppError(`O campo ${fieldName} deve conter um JSON válido.`, 400);
    }
  }

  if (value === undefined) {
    throw new AppError(`O campo ${fieldName} é obrigatório.`, 400);
  }

  return value;
}

function normalizeValueByType(value, valueType, fieldName = 'value') {
  if (!ALLOWED_VALUE_TYPES.includes(valueType)) {
    throw new AppError('O tipo da configuração é inválido.', 400);
  }

  if (valueType === 'number') {
    return parseNumberValue(value, fieldName);
  }

  if (valueType === 'boolean') {
    return parseBooleanValue(value, fieldName);
  }

  if (valueType === 'json') {
    return parseJsonValue(value, fieldName);
  }

  return value === null || value === undefined ? '' : String(value);
}

function serializeValueByType(value, valueType) {
  if (valueType === 'json') {
    return JSON.stringify(value);
  }

  if (valueType === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function deserializeValueByType(value, valueType) {
  if (valueType === 'number') {
    return Number(value);
  }

  if (valueType === 'boolean') {
    return value === 'true' || value === '1' || value === 1;
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

function formatSetting(settingRow) {
  const definition = systemSettingsCatalogMap.get(settingRow.setting_key);

  return {
    id: settingRow.id,
    setting_key: settingRow.setting_key,
    setting_value: settingRow.setting_value,
    value_type: settingRow.value_type,
    value: deserializeValueByType(settingRow.setting_value, settingRow.value_type),
    section: definition?.section || null,
    created_at: settingRow.created_at,
    updated_at: settingRow.updated_at,
  };
}

async function listPublicSettings() {
  const publicKeys = [
    'main_teacher_name',
    'main_teacher_phone',
    'main_teacher_email',
    'allow_same_day_booking',
    'default_slot_duration_minutes',
    'default_weekday_start_time',
    'default_weekday_end_time',
    'default_excluded_hours',
    'default_saturday_hours',
  ];

  const values = await getSystemSettings(publicKeys);

  return publicKeys.map((settingKey) => {
    const definition = systemSettingsCatalogMap.get(settingKey);

    return {
      setting_key: settingKey,
      value_type: definition?.value_type || 'string',
      value: values[settingKey],
      section: definition?.section || null,
    };
  });
}

async function getExistingSetting(settingKey) {
  const setting = await systemSettingModel.findByKey(settingKey);

  if (!setting) {
    throw new AppError('Configuração não encontrada.', 404);
  }

  return setting;
}

async function listSettings(currentUser) {
  ensureAdminRequester(currentUser);

  const settings = await systemSettingModel.findAll();

  return settings.map(formatSetting);
}

async function getSettingByKey(settingKey, currentUser) {
  ensureAdminRequester(currentUser);
  getSettingDefinition(settingKey);

  const setting = await getExistingSetting(settingKey);

  return formatSetting(setting);
}

async function updateSetting(settingKey, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const definition = getSettingDefinition(settingKey);
  await getExistingSetting(settingKey);

  const nextValue = payload?.value !== undefined ? payload.value : payload?.setting_value;
  const normalizedValue = normalizeValueByType(nextValue, definition.value_type);

  await systemSettingModel.upsertSetting({
    settingKey,
    settingValue: serializeValueByType(normalizedValue, definition.value_type),
    valueType: definition.value_type,
  });

  const updatedSetting = await systemSettingModel.findByKey(settingKey);

  return formatSetting(updatedSetting);
}

async function updateManySettings(payload, currentUser) {
  ensureAdminRequester(currentUser);

  const settingsPayload = payload?.settings;

  if (!settingsPayload || typeof settingsPayload !== 'object' || Array.isArray(settingsPayload)) {
    throw new AppError('O corpo deve conter um objeto settings com as chaves a serem atualizadas.', 400);
  }

  const entries = Object.entries(settingsPayload);

  if (!entries.length) {
    throw new AppError('Nenhuma configuração foi informada para atualização.', 400);
  }

  const updates = [];

  for (const [settingKey, value] of entries) {
    const definition = getSettingDefinition(settingKey);
    await getExistingSetting(settingKey);

    const normalizedValue = normalizeValueByType(value, definition.value_type, settingKey);

    updates.push({
      settingKey,
      settingValue: serializeValueByType(normalizedValue, definition.value_type),
      valueType: definition.value_type,
    });
  }

  await systemSettingModel.upsertMany(updates);

  const updatedSettings = await Promise.all(
    updates.map(({ settingKey }) => systemSettingModel.findByKey(settingKey))
  );

  return updatedSettings.map(formatSetting);
}

module.exports = {
  listPublicSettings,
  listSettings,
  getSettingByKey,
  updateSetting,
  updateManySettings,
  normalizeValueByType,
  serializeValueByType,
};

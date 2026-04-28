const availabilityRuleModel = require('../models/availabilityRuleModel');
const AppError = require('../utils/AppError');
const {
  isTimeRangeValid,
  normalizeTime,
  toApiWeekday,
  toDatabaseWeekday,
} = require('../utils/schedule');
const { resolveAdminUserId } = require('./scheduleSupportService');

function normalizeBooleanValue(value, fallback = true) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false;
  }

  throw new AppError('O campo is_active deve ser booleano.', 400);
}

function formatRule(rule) {
  return {
    id: rule.id,
    user_id: rule.user_id,
    weekday: toApiWeekday(Number(rule.weekday)),
    start_time: rule.start_time,
    end_time: rule.end_time,
    slot_duration_minutes: rule.slot_duration_minutes,
    is_active: Boolean(rule.is_active),
    created_at: rule.created_at,
    updated_at: rule.updated_at,
  };
}

async function normalizeRulePayload(payload, currentUser, existingRule = null) {
  const userId = await resolveAdminUserId({
    requestedUserId: payload.user_id ?? existingRule?.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });
  const weekdayValue = Number(payload.weekday ?? toApiWeekday(Number(existingRule?.weekday)));
  const startTime = normalizeTime(payload.start_time ?? existingRule?.start_time);
  const endTime = normalizeTime(payload.end_time ?? existingRule?.end_time);
  const slotDurationMinutes = Number(
    payload.slot_duration_minutes ?? existingRule?.slot_duration_minutes
  );
  const isActive = normalizeBooleanValue(payload.is_active, existingRule ? Boolean(existingRule.is_active) : true);

  if (!Number.isInteger(weekdayValue) || weekdayValue < 1 || weekdayValue > 7) {
    throw new AppError('O campo weekday é obrigatório e deve estar entre 1 e 7.', 400);
  }

  if (!startTime) {
    throw new AppError('O campo start_time é obrigatório.', 400);
  }

  if (!endTime) {
    throw new AppError('O campo end_time é obrigatório.', 400);
  }

  if (!Number.isInteger(slotDurationMinutes) || slotDurationMinutes <= 0) {
    throw new AppError(
      'O campo slot_duration_minutes é obrigatório e deve ser um número inteiro positivo.',
      400
    );
  }

  if (!isTimeRangeValid(startTime, endTime)) {
    throw new AppError('O campo end_time deve ser maior que start_time.', 400);
  }

  return {
    userId,
    weekday: toDatabaseWeekday(weekdayValue),
    startTime,
    endTime,
    slotDurationMinutes,
    isActive,
  };
}

async function createRule(payload, currentUser) {
  const data = await normalizeRulePayload(payload, currentUser);
  const ruleId = await availabilityRuleModel.createRule(data);
  const rule = await availabilityRuleModel.findById(ruleId);

  return formatRule(rule);
}

async function listRules(query, currentUser) {
  const filters = {
    userId: await resolveAdminUserId({
      requestedUserId: query.user_id,
      currentUser,
      requireCurrentAdmin: true,
    }),
  };

  const rules = await availabilityRuleModel.findAll(filters);

  return rules.map(formatRule);
}

async function getRuleById(id, currentUser) {
  const ruleId = Number(id);

  if (!Number.isInteger(ruleId) || ruleId <= 0) {
    throw new AppError('O id da regra é inválido.', 400);
  }

  const rule = await availabilityRuleModel.findById(ruleId);

  if (!rule) {
    throw new AppError('Regra de disponibilidade não encontrada.', 404);
  }

  await resolveAdminUserId({
    requestedUserId: rule.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });

  return formatRule(rule);
}

async function updateRule(id, payload, currentUser) {
  const ruleId = Number(id);

  if (!Number.isInteger(ruleId) || ruleId <= 0) {
    throw new AppError('O id da regra é inválido.', 400);
  }

  const existingRule = await availabilityRuleModel.findById(ruleId);

  if (!existingRule) {
    throw new AppError('Regra de disponibilidade não encontrada.', 404);
  }

  const data = await normalizeRulePayload(payload, currentUser, existingRule);
  await availabilityRuleModel.updateById(ruleId, data);

  const updatedRule = await availabilityRuleModel.findById(ruleId);

  return formatRule(updatedRule);
}

async function deleteRule(id, currentUser) {
  const ruleId = Number(id);

  if (!Number.isInteger(ruleId) || ruleId <= 0) {
    throw new AppError('O id da regra é inválido.', 400);
  }

  const existingRule = await availabilityRuleModel.findById(ruleId);

  if (!existingRule) {
    throw new AppError('Regra de disponibilidade não encontrada.', 404);
  }

  await resolveAdminUserId({
    requestedUserId: existingRule.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });

  await availabilityRuleModel.deleteById(ruleId);
}

module.exports = {
  createRule,
  listRules,
  getRuleById,
  updateRule,
  deleteRule,
};

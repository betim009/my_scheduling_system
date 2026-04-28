const planModel = require('../models/planModel');
const AppError = require('../utils/AppError');

function normalizePlanId(id) {
  const planId = Number(id);

  if (!Number.isInteger(planId) || planId <= 0) {
    throw new AppError('O id do plano é inválido.', 400);
  }

  return planId;
}

function normalizePositiveInteger(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`O campo ${fieldName} é obrigatório e deve ser maior que zero.`, 400);
  }

  return parsedValue;
}

function normalizeDecimal(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new AppError(`O campo ${fieldName} é obrigatório.`, 400);
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new AppError(`O campo ${fieldName} não pode ser negativo.`, 400);
  }

  return Number(parsedValue.toFixed(2));
}

function normalizeBoolean(value, fieldName) {
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

function ensureAdminRequester(currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Apenas admins podem executar esta operação.', 403);
  }
}

function formatPlan(plan) {
  return {
    id: plan.id,
    name: plan.name,
    total_classes: plan.total_classes,
    classes_per_week: plan.classes_per_week,
    price: Number(plan.price),
    price_per_class: Number(plan.price_per_class),
    is_active: Boolean(plan.is_active),
    created_at: plan.created_at,
    updated_at: plan.updated_at,
  };
}

function normalizePlanPayload(payload) {
  const name = String(payload.name || '').trim();

  if (!name) {
    throw new AppError('O campo name é obrigatório.', 400);
  }

  return {
    name,
    totalClasses: normalizePositiveInteger(payload.total_classes, 'total_classes'),
    classesPerWeek: normalizePositiveInteger(payload.classes_per_week, 'classes_per_week'),
    price: normalizeDecimal(payload.price, 'price'),
    pricePerClass: normalizeDecimal(payload.price_per_class, 'price_per_class'),
  };
}

async function getExistingPlan(planId) {
  const plan = await planModel.findById(planId);

  if (!plan) {
    throw new AppError('Plano não encontrado.', 404);
  }

  return plan;
}

async function createPlan(payload, currentUser) {
  ensureAdminRequester(currentUser);

  const normalizedPayload = normalizePlanPayload(payload);
  const planId = await planModel.createPlan(normalizedPayload);
  const plan = await planModel.findById(planId);

  return formatPlan(plan);
}

async function listPlans(currentUser) {
  const onlyActive = currentUser.role !== 'admin';
  const plans = await planModel.findAll({ onlyActive });

  return plans.map(formatPlan);
}

async function getPlanById(id, currentUser) {
  const planId = normalizePlanId(id);
  const plan = await getExistingPlan(planId);

  if (currentUser.role !== 'admin' && !plan.is_active) {
    throw new AppError('Plano não encontrado.', 404);
  }

  return formatPlan(plan);
}

async function updatePlan(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const planId = normalizePlanId(id);
  await getExistingPlan(planId);

  const normalizedPayload = normalizePlanPayload(payload);
  await planModel.updatePlan(planId, normalizedPayload);

  const updatedPlan = await planModel.findById(planId);

  return formatPlan(updatedPlan);
}

async function togglePlanActive(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const planId = normalizePlanId(id);
  const existingPlan = await getExistingPlan(planId);

  let nextIsActive = !existingPlan.is_active;

  if (payload && payload.is_active !== undefined) {
    nextIsActive = normalizeBoolean(payload.is_active, 'is_active');
  }

  await planModel.updateActiveStatus(planId, nextIsActive);

  const updatedPlan = await planModel.findById(planId);

  return formatPlan(updatedPlan);
}

async function deletePlan(id, currentUser) {
  ensureAdminRequester(currentUser);

  const planId = normalizePlanId(id);
  await getExistingPlan(planId);
  await planModel.updateActiveStatus(planId, false);

  const updatedPlan = await planModel.findById(planId);

  return formatPlan(updatedPlan);
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  togglePlanActive,
  deletePlan,
};

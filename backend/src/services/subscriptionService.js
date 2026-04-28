const planModel = require('../models/planModel');
const subscriptionModel = require('../models/subscriptionModel');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { isValidDateString } = require('../utils/schedule');

const SUBSCRIPTION_STATUSES = ['active', 'completed', 'cancelled', 'expired'];

function ensureStudentRequester(currentUser) {
  if (currentUser.role !== 'student') {
    throw new AppError('Apenas students podem executar esta operação.', 403);
  }
}

function ensureAdminRequester(currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Apenas admins podem executar esta operação.', 403);
  }
}

function normalizeSubscriptionId(id) {
  const subscriptionId = Number(id);

  if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
    throw new AppError('O id da assinatura é inválido.', 400);
  }

  return subscriptionId;
}

function normalizePositiveInteger(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`O campo ${fieldName} é obrigatório e deve ser maior que zero.`, 400);
  }

  return parsedValue;
}

function normalizeNonNegativeInteger(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new AppError(`O campo ${fieldName} deve ser um número inteiro não negativo.`, 400);
  }

  return parsedValue;
}

function normalizeDate(value, fieldName) {
  const normalizedValue = String(value || '').trim();

  if (!isValidDateString(normalizedValue)) {
    throw new AppError(`O campo ${fieldName} é obrigatório e deve estar no formato YYYY-MM-DD.`, 400);
  }

  return normalizedValue;
}

function normalizeStatus(value, { fieldName = 'status', required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new AppError(`O campo ${fieldName} é obrigatório.`, 400);
    }

    return undefined;
  }

  const status = String(value).trim();

  if (!SUBSCRIPTION_STATUSES.includes(status)) {
    throw new AppError(`O campo ${fieldName} deve ser um dos status válidos.`, 400);
  }

  return status;
}

function ensureDateRange(startDate, endDate) {
  if (startDate > endDate) {
    throw new AppError('O campo end_date deve ser maior ou igual a start_date.', 400);
  }
}

function formatSubscription(subscription) {
  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    student_id: subscription.student_id,
    plan_id: subscription.plan_id,
    start_date: subscription.start_date,
    end_date: subscription.end_date,
    total_classes: subscription.total_classes,
    remaining_classes: subscription.remaining_classes,
    status: subscription.status,
    student_name: subscription.student_name,
    student_email: subscription.student_email,
    student_username: subscription.student_username,
    plan_name: subscription.plan_name,
    classes_per_week: subscription.classes_per_week,
    price: subscription.price !== undefined ? Number(subscription.price) : undefined,
    price_per_class:
      subscription.price_per_class !== undefined ? Number(subscription.price_per_class) : undefined,
    plan_is_active:
      subscription.plan_is_active === undefined ? undefined : Boolean(subscription.plan_is_active),
    created_at: subscription.created_at,
    updated_at: subscription.updated_at,
  };
}

async function getExistingSubscription(subscriptionId) {
  const subscription = await subscriptionModel.findById(subscriptionId);

  if (!subscription) {
    throw new AppError('Assinatura não encontrada.', 404);
  }

  return subscription;
}

async function ensureStudentTarget(studentId) {
  const user = await userModel.findById(studentId);

  if (!user) {
    throw new AppError('Aluno informado não foi encontrado.', 404);
  }

  if (user.role !== 'student') {
    throw new AppError('A assinatura só pode ser criada para usuários com role student.', 400);
  }

  return user;
}

async function ensurePlanTarget(planId) {
  const plan = await planModel.findById(planId);

  if (!plan) {
    throw new AppError('Plano informado não foi encontrado.', 404);
  }

  return plan;
}

function normalizeCreatePayload(payload) {
  const studentId = normalizePositiveInteger(payload.student_id, 'student_id');
  const planId = normalizePositiveInteger(payload.plan_id, 'plan_id');
  const startDate = normalizeDate(payload.start_date, 'start_date');
  const endDate = normalizeDate(payload.end_date, 'end_date');
  const status = normalizeStatus(payload.status, { required: false }) || 'active';

  ensureDateRange(startDate, endDate);

  return {
    studentId,
    planId,
    startDate,
    endDate,
    status,
  };
}

function normalizeUpdatePayload(payload, existingSubscription) {
  if (payload.student_id !== undefined && Number(payload.student_id) !== existingSubscription.student_id) {
    throw new AppError(
      'Não é permitido alterar o student_id de uma assinatura existente. Crie uma nova assinatura.',
      400
    );
  }

  if (payload.plan_id !== undefined && Number(payload.plan_id) !== existingSubscription.plan_id) {
    throw new AppError(
      'Não é permitido alterar o plan_id de uma assinatura existente. Crie uma nova assinatura.',
      400
    );
  }

  const startDate = normalizeDate(payload.start_date, 'start_date');
  const endDate = normalizeDate(payload.end_date, 'end_date');
  const status =
    normalizeStatus(payload.status, { required: false }) || existingSubscription.status;

  ensureDateRange(startDate, endDate);

  return {
    startDate,
    endDate,
    status,
  };
}

async function createSubscription(payload, currentUser) {
  ensureAdminRequester(currentUser);

  const normalizedPayload = normalizeCreatePayload(payload);
  const [student, plan] = await Promise.all([
    ensureStudentTarget(normalizedPayload.studentId),
    ensurePlanTarget(normalizedPayload.planId),
  ]);

  const totalClasses = plan.total_classes;
  const remainingClasses = plan.total_classes;

  const subscriptionId = await subscriptionModel.createSubscription({
    studentId: student.id,
    planId: plan.id,
    startDate: normalizedPayload.startDate,
    endDate: normalizedPayload.endDate,
    totalClasses,
    remainingClasses,
    status: normalizedPayload.status,
  });

  const subscription = await subscriptionModel.findById(subscriptionId);

  return formatSubscription(subscription);
}

async function listSubscriptions(query, currentUser) {
  ensureAdminRequester(currentUser);

  const filters = {};

  if (query.student_id !== undefined) {
    filters.studentId = normalizePositiveInteger(query.student_id, 'student_id');
  }

  if (query.plan_id !== undefined) {
    filters.planId = normalizePositiveInteger(query.plan_id, 'plan_id');
  }

  if (query.status !== undefined) {
    filters.status = normalizeStatus(query.status);
  }

  const subscriptions = await subscriptionModel.findAll(filters);

  return subscriptions.map(formatSubscription);
}

async function listMySubscriptions(currentUser) {
  ensureStudentRequester(currentUser);

  const subscriptions = await subscriptionModel.findAll({
    studentId: currentUser.id,
  });

  return subscriptions.map(formatSubscription);
}

async function getSubscriptionById(id, currentUser) {
  const subscriptionId = normalizeSubscriptionId(id);
  const subscription = await getExistingSubscription(subscriptionId);

  if (currentUser.role === 'student' && subscription.student_id !== currentUser.id) {
    throw new AppError('Você não tem permissão para visualizar esta assinatura.', 403);
  }

  return formatSubscription(subscription);
}

async function updateSubscription(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const subscriptionId = normalizeSubscriptionId(id);
  const existingSubscription = await getExistingSubscription(subscriptionId);
  const normalizedPayload = normalizeUpdatePayload(payload, existingSubscription);

  await subscriptionModel.updateSubscription(subscriptionId, normalizedPayload);

  const updatedSubscription = await subscriptionModel.findById(subscriptionId);

  return formatSubscription(updatedSubscription);
}

async function updateSubscriptionStatus(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const subscriptionId = normalizeSubscriptionId(id);
  await getExistingSubscription(subscriptionId);

  const status = normalizeStatus(payload.status);
  await subscriptionModel.updateStatus(subscriptionId, status);

  const updatedSubscription = await subscriptionModel.findById(subscriptionId);

  return formatSubscription(updatedSubscription);
}

async function updateRemainingClasses(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const subscriptionId = normalizeSubscriptionId(id);
  const existingSubscription = await getExistingSubscription(subscriptionId);
  const remainingClasses = normalizeNonNegativeInteger(
    payload.remaining_classes,
    'remaining_classes'
  );

  if (remainingClasses > existingSubscription.total_classes) {
    throw new AppError('O campo remaining_classes não pode ser maior que total_classes.', 400);
  }

  await subscriptionModel.updateRemainingClasses(subscriptionId, remainingClasses);

  const updatedSubscription = await subscriptionModel.findById(subscriptionId);

  return formatSubscription(updatedSubscription);
}

async function getMySubscriptionsSummary(currentUser) {
  ensureStudentRequester(currentUser);

  const summary = await subscriptionModel.findSummaryByStudentId(currentUser.id);

  return {
    active_subscriptions_count: summary.active_subscriptions_count,
    total_remaining_classes: summary.total_remaining_classes,
    current_subscription: formatSubscription(summary.current_subscription),
  };
}

module.exports = {
  createSubscription,
  listSubscriptions,
  listMySubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionStatus,
  updateRemainingClasses,
  getMySubscriptionsSummary,
};

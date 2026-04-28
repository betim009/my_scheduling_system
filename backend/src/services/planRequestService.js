const { pool } = require('../database/connection');
const planModel = require('../models/planModel');
const planRequestModel = require('../models/planRequestModel');
const subscriptionModel = require('../models/subscriptionModel');
const userModel = require('../models/userModel');
const {
  getSystemSettings,
  renderTemplate,
  sanitizePhoneNumber,
} = require('./systemSettingsRuntimeService');
const AppError = require('../utils/AppError');

const PLAN_REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

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

function normalizePlanRequestId(id) {
  const requestId = Number(id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    throw new AppError('O id da solicitação de plano é inválido.', 400);
  }

  return requestId;
}

function normalizePositiveInteger(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`O campo ${fieldName} é obrigatório e deve ser maior que zero.`, 400);
  }

  return parsedValue;
}

function normalizeStatus(value, { required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new AppError('O campo status é obrigatório.', 400);
    }

    return undefined;
  }

  const status = String(value).trim();

  if (!PLAN_REQUEST_STATUSES.includes(status)) {
    throw new AppError('O campo status informado é inválido.', 400);
  }

  return status;
}

function formatPlanRequest(planRequest) {
  return {
    id: planRequest.id,
    student_id: planRequest.student_id,
    plan_id: planRequest.plan_id,
    status: planRequest.status,
    student_name: planRequest.student_name,
    student_email: planRequest.student_email,
    plan_name: planRequest.plan_name,
    total_classes: Number(planRequest.total_classes || 0),
    classes_per_week: Number(planRequest.classes_per_week || 0),
    price: Number(planRequest.price || 0),
    price_per_class: Number(planRequest.price_per_class || 0),
    plan_is_active: Boolean(planRequest.plan_is_active),
    created_at: planRequest.created_at,
    updated_at: planRequest.updated_at,
  };
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
    plan_name: subscription.plan_name,
    classes_per_week:
      subscription.classes_per_week !== undefined ? Number(subscription.classes_per_week) : null,
    price: subscription.price !== undefined ? Number(subscription.price) : null,
    price_per_class:
      subscription.price_per_class !== undefined ? Number(subscription.price_per_class) : null,
    created_at: subscription.created_at,
    updated_at: subscription.updated_at,
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getSubscriptionPeriod(durationDays) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + Number(durationDays || 30));

  return {
    startDate: formatDate(today),
    endDate: formatDate(endDate),
  };
}

function buildWhatsAppLink(phoneNumber, message) {
  const sanitizedPhone = sanitizePhoneNumber(phoneNumber);

  if (!sanitizedPhone) {
    return '';
  }

  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

async function ensureStudentTarget(studentId) {
  const student = await userModel.findById(studentId);

  if (!student) {
    throw new AppError('Aluno não encontrado.', 404);
  }

  if (student.role !== 'student') {
    throw new AppError('A solicitação de plano só pode ser vinculada a um student.', 400);
  }

  return student;
}

async function ensurePlanTarget(planId, { onlyActiveForStudent = false } = {}) {
  const plan = await planModel.findById(planId);

  if (!plan) {
    throw new AppError('Plano não encontrado.', 404);
  }

  if (onlyActiveForStudent && !plan.is_active) {
    throw new AppError('Este plano não está disponível para solicitação.', 409);
  }

  return plan;
}

async function createPlanRequest(payload, currentUser) {
  ensureStudentRequester(currentUser);

  const planId = normalizePositiveInteger(payload.plan_id, 'plan_id');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [student, plan, settings] = await Promise.all([
      ensureStudentTarget(currentUser.id),
      ensurePlanTarget(planId, { onlyActiveForStudent: true }),
      getSystemSettings([
        'main_teacher_name',
        'main_teacher_phone',
        'plan_request_notification_template',
      ]),
    ]);

    const existingPendingRequest = await planRequestModel.findPendingByStudentAndPlan(connection, {
      studentId: student.id,
      planId: plan.id,
    });

    if (existingPendingRequest) {
      throw new AppError('Já existe uma solicitação pendente para este plano.', 409);
    }

    const planRequestId = await planRequestModel.createPlanRequest(connection, {
      studentId: student.id,
      planId: plan.id,
      status: 'pending',
    });

    await connection.commit();

    const planRequest = await planRequestModel.findById(planRequestId);
    const notificationMessage = renderTemplate(settings.plan_request_notification_template, {
      student_name: student.name,
      plan_name: plan.name,
      teacher_name: settings.main_teacher_name,
    });

    return {
      plan_request: formatPlanRequest(planRequest),
      whatsapp_link: buildWhatsAppLink(settings.main_teacher_phone, notificationMessage),
      whatsapp_contact_name: settings.main_teacher_name,
      notification_message: notificationMessage,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listPlanRequests(query, currentUser) {
  const filters = {};

  if (currentUser.role === 'student') {
    filters.studentId = currentUser.id;
  } else if (currentUser.role !== 'admin') {
    throw new AppError('Você não tem permissão para listar solicitações de planos.', 403);
  }

  if (query.student_id !== undefined) {
    ensureAdminRequester(currentUser);
    filters.studentId = normalizePositiveInteger(query.student_id, 'student_id');
  }

  if (query.plan_id !== undefined) {
    filters.planId = normalizePositiveInteger(query.plan_id, 'plan_id');
  }

  if (query.status !== undefined) {
    filters.status = normalizeStatus(query.status);
  }

  const planRequests = await planRequestModel.findAll(filters);

  return planRequests.map(formatPlanRequest);
}

async function getPlanRequestById(id, currentUser) {
  const requestId = normalizePlanRequestId(id);
  const planRequest = await planRequestModel.findById(requestId);

  if (!planRequest) {
    throw new AppError('Solicitação de plano não encontrada.', 404);
  }

  if (currentUser.role === 'student' && planRequest.student_id !== currentUser.id) {
    throw new AppError('Você não tem permissão para visualizar esta solicitação de plano.', 403);
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'student') {
    throw new AppError('Você não tem permissão para visualizar esta solicitação de plano.', 403);
  }

  return formatPlanRequest(planRequest);
}

async function approvePlanRequest(id, currentUser) {
  ensureAdminRequester(currentUser);

  const requestId = normalizePlanRequestId(id);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const planRequest = await planRequestModel.findByIdForUpdate(connection, requestId);

    if (!planRequest) {
      throw new AppError('Solicitação de plano não encontrada.', 404);
    }

    if (planRequest.status !== 'pending') {
      throw new AppError('A solicitação precisa estar pending para ser aprovada.', 409);
    }

    const [_student, _plan, settings] = await Promise.all([
      ensureStudentTarget(planRequest.student_id),
      ensurePlanTarget(planRequest.plan_id),
      getSystemSettings([
        'default_subscription_duration_days',
        'auto_activate_subscription_after_approval',
      ]),
    ]);

    const { startDate, endDate } = getSubscriptionPeriod(
      settings.default_subscription_duration_days
    );
    // The current schema does not yet support an inactive pending subscription status.
    // Keep the subscription active for now and preserve the config read for future evolution.
    const subscriptionStatus = settings.auto_activate_subscription_after_approval
      ? 'active'
      : 'active';

    const subscriptionId = await subscriptionModel.createSubscriptionWithExecutor(connection, {
      studentId: planRequest.student_id,
      planId: planRequest.plan_id,
      startDate,
      endDate,
      totalClasses: Number(planRequest.total_classes),
      remainingClasses: Number(planRequest.total_classes),
      status: subscriptionStatus,
    });

    await planRequestModel.updateById(connection, requestId, {
      status: 'approved',
    });

    await connection.commit();

    const [updatedPlanRequest, subscription] = await Promise.all([
      planRequestModel.findById(requestId),
      subscriptionModel.findById(subscriptionId),
    ]);

    return {
      plan_request: formatPlanRequest(updatedPlanRequest),
      subscription: formatSubscription(subscription),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function rejectPlanRequest(id, currentUser) {
  ensureAdminRequester(currentUser);

  const requestId = normalizePlanRequestId(id);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const planRequest = await planRequestModel.findByIdForUpdate(connection, requestId);

    if (!planRequest) {
      throw new AppError('Solicitação de plano não encontrada.', 404);
    }

    if (planRequest.status !== 'pending') {
      throw new AppError('A solicitação precisa estar pending para ser rejeitada.', 409);
    }

    await planRequestModel.updateById(connection, requestId, {
      status: 'rejected',
    });

    await connection.commit();

    const updatedPlanRequest = await planRequestModel.findById(requestId);

    return formatPlanRequest(updatedPlanRequest);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createPlanRequest,
  listPlanRequests,
  getPlanRequestById,
  approvePlanRequest,
  rejectPlanRequest,
};

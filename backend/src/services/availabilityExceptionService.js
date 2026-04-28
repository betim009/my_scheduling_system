const availabilityExceptionModel = require('../models/availabilityExceptionModel');
const AppError = require('../utils/AppError');
const { isTimeRangeValid, isValidDateString, normalizeTime } = require('../utils/schedule');
const { resolveAdminUserId } = require('./scheduleSupportService');

const ALLOWED_EXCEPTION_TYPES = [
  'block_full_day',
  'block_time_range',
  'extra_time_range',
  'custom_time_range',
];

function formatException(exception) {
  return {
    id: exception.id,
    user_id: exception.user_id,
    exception_date: exception.exception_date,
    type: exception.type,
    start_time: exception.start_time,
    end_time: exception.end_time,
    reason: exception.reason,
    created_at: exception.created_at,
    updated_at: exception.updated_at,
  };
}

async function normalizeExceptionPayload(payload, currentUser, existingException = null) {
  const userId = await resolveAdminUserId({
    requestedUserId: payload.user_id ?? existingException?.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });
  const exceptionDate = String(
    payload.exception_date ?? existingException?.exception_date ?? ''
  ).trim();
  const type = String(payload.type ?? existingException?.type ?? '').trim();
  const reasonValue = payload.reason ?? existingException?.reason ?? null;
  const reason = reasonValue === null || reasonValue === undefined || reasonValue === ''
    ? null
    : String(reasonValue).trim();

  if (!exceptionDate || !isValidDateString(exceptionDate)) {
    throw new AppError(
      'O campo exception_date é obrigatório e deve estar no formato YYYY-MM-DD.',
      400
    );
  }

  if (!ALLOWED_EXCEPTION_TYPES.includes(type)) {
    throw new AppError(
      'O campo type é obrigatório e deve ser um dos tipos aceitos.',
      400
    );
  }

  let startTime = normalizeTime(payload.start_time ?? existingException?.start_time);
  let endTime = normalizeTime(payload.end_time ?? existingException?.end_time);

  if (type === 'block_full_day') {
    startTime = null;
    endTime = null;
  } else if (!startTime || !endTime) {
    throw new AppError(
      'Os campos start_time e end_time são obrigatórios para este tipo de exceção.',
      400
    );
  }

  if ((startTime || endTime) && !isTimeRangeValid(startTime, endTime)) {
    throw new AppError('O campo end_time deve ser maior que start_time.', 400);
  }

  return {
    userId,
    exceptionDate,
    type,
    startTime,
    endTime,
    reason,
  };
}

async function normalizeExceptionFilters(query, currentUser) {
  const filters = {
    userId: await resolveAdminUserId({
      requestedUserId: query.user_id,
      currentUser,
      requireCurrentAdmin: true,
    }),
  };

  const hasStartDate = query.start_date !== undefined;
  const hasEndDate = query.end_date !== undefined;

  if (hasStartDate || hasEndDate) {
    if (!hasStartDate || !hasEndDate) {
      throw new AppError(
        'Os filtros start_date e end_date devem ser informados juntos.',
        400
      );
    }

    if (!isValidDateString(query.start_date) || !isValidDateString(query.end_date)) {
      throw new AppError(
        'Os filtros start_date e end_date devem estar no formato YYYY-MM-DD.',
        400
      );
    }

    if (query.start_date > query.end_date) {
      throw new AppError('start_date não pode ser maior que end_date.', 400);
    }

    filters.startDate = query.start_date;
    filters.endDate = query.end_date;
  }

  return filters;
}

async function createException(payload, currentUser) {
  const data = await normalizeExceptionPayload(payload, currentUser);
  const exceptionId = await availabilityExceptionModel.createException(data);
  const exception = await availabilityExceptionModel.findById(exceptionId);

  return formatException(exception);
}

async function listExceptions(query, currentUser) {
  const filters = await normalizeExceptionFilters(query, currentUser);
  const exceptions = await availabilityExceptionModel.findAll(filters);

  return exceptions.map(formatException);
}

async function getExceptionById(id, currentUser) {
  const exceptionId = Number(id);

  if (!Number.isInteger(exceptionId) || exceptionId <= 0) {
    throw new AppError('O id da exceção é inválido.', 400);
  }

  const exception = await availabilityExceptionModel.findById(exceptionId);

  if (!exception) {
    throw new AppError('Exceção de disponibilidade não encontrada.', 404);
  }

  await resolveAdminUserId({
    requestedUserId: exception.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });

  return formatException(exception);
}

async function updateException(id, payload, currentUser) {
  const exceptionId = Number(id);

  if (!Number.isInteger(exceptionId) || exceptionId <= 0) {
    throw new AppError('O id da exceção é inválido.', 400);
  }

  const existingException = await availabilityExceptionModel.findById(exceptionId);

  if (!existingException) {
    throw new AppError('Exceção de disponibilidade não encontrada.', 404);
  }

  const data = await normalizeExceptionPayload(payload, currentUser, existingException);
  await availabilityExceptionModel.updateById(exceptionId, data);

  const updatedException = await availabilityExceptionModel.findById(exceptionId);

  return formatException(updatedException);
}

async function deleteException(id, currentUser) {
  const exceptionId = Number(id);

  if (!Number.isInteger(exceptionId) || exceptionId <= 0) {
    throw new AppError('O id da exceção é inválido.', 400);
  }

  const existingException = await availabilityExceptionModel.findById(exceptionId);

  if (!existingException) {
    throw new AppError('Exceção de disponibilidade não encontrada.', 404);
  }

  await resolveAdminUserId({
    requestedUserId: existingException.user_id,
    currentUser,
    requireCurrentAdmin: true,
  });

  await availabilityExceptionModel.deleteById(exceptionId);
}

module.exports = {
  ALLOWED_EXCEPTION_TYPES,
  createException,
  listExceptions,
  getExceptionById,
  updateException,
  deleteException,
};

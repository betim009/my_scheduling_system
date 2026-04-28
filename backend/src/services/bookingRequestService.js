const bookingRequestModel = require('../models/bookingRequestModel');
const bookingModel = require('../models/bookingModel');
const calendarSlotModel = require('../models/calendarSlotModel');
const subscriptionModel = require('../models/subscriptionModel');
const { pool } = require('../database/connection');
const AppError = require('../utils/AppError');
const {
  isTimeRangeValid,
  isValidDateString,
  normalizeTime,
} = require('../utils/schedule');
const { ensureAdminUserTarget, normalizeUserId } = require('./scheduleSupportService');
const { getSystemSettings, renderTemplate } = require('./systemSettingsRuntimeService');

const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

function formatBooking(booking) {
  if (!booking) {
    return null;
  }

  return {
    id: booking.id,
    booking_request_id: booking.booking_request_id,
    student_id: booking.student_id,
    teacher_id: booking.teacher_id,
    subscription_id: booking.subscription_id,
    booking_date: booking.booking_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    notes: booking.notes,
    student_name: booking.student_name,
    student_email: booking.student_email,
    teacher_name: booking.teacher_name,
    teacher_email: booking.teacher_email,
    plan_id: booking.plan_id,
    plan_name: booking.plan_name,
    subscription_remaining_classes: booking.remaining_classes,
    subscription_status: booking.subscription_status,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
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
    plan_name: subscription.plan_name,
    start_date: subscription.start_date,
    end_date: subscription.end_date,
    total_classes: subscription.total_classes,
    remaining_classes: subscription.remaining_classes,
    status: subscription.status,
    created_at: subscription.created_at,
    updated_at: subscription.updated_at,
  };
}

function formatBookingRequest(bookingRequest) {
  return {
    id: bookingRequest.id,
    student_id: bookingRequest.student_id,
    teacher_id: bookingRequest.teacher_id,
    requested_date: bookingRequest.requested_date,
    start_time: bookingRequest.start_time,
    end_time: bookingRequest.end_time,
    status: bookingRequest.status,
    student_message: bookingRequest.student_message,
    admin_message: bookingRequest.admin_message,
    student_name: bookingRequest.student_name,
    student_email: bookingRequest.student_email,
    teacher_name: bookingRequest.teacher_name,
    teacher_email: bookingRequest.teacher_email,
    booking_id: bookingRequest.booking_id,
    booking_status: bookingRequest.booking_status,
    created_at: bookingRequest.created_at,
    updated_at: bookingRequest.updated_at,
  };
}

function normalizeRequestId(id) {
  const requestId = Number(id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    throw new AppError('O id da solicitação é inválido.', 400);
  }

  return requestId;
}

function normalizeCreatePayload(payload) {
  const teacherId = normalizeUserId(payload.teacher_id);
  const requestedDate = String(payload.requested_date || '').trim();
  const startTime = normalizeTime(payload.start_time);
  const endTime = normalizeTime(payload.end_time);
  const studentMessageValue = payload.student_message;
  const studentMessage =
    studentMessageValue === undefined || studentMessageValue === null || studentMessageValue === ''
      ? null
      : String(studentMessageValue).trim();

  if (!isValidDateString(requestedDate)) {
    throw new AppError(
      'O campo requested_date é obrigatório e deve estar no formato YYYY-MM-DD.',
      400
    );
  }

  if (!startTime) {
    throw new AppError('O campo start_time é obrigatório.', 400);
  }

  if (!endTime) {
    throw new AppError('O campo end_time é obrigatório.', 400);
  }

  if (!isTimeRangeValid(startTime, endTime)) {
    throw new AppError('O campo end_time deve ser maior que start_time.', 400);
  }

  return {
    teacherId,
    requestedDate,
    startTime,
    endTime,
    studentMessage,
  };
}

function normalizeAdminMessage(payload) {
  const adminMessageValue = payload?.admin_message;

  if (adminMessageValue === undefined) {
    return undefined;
  }

  if (adminMessageValue === null || adminMessageValue === '') {
    return null;
  }

  return String(adminMessageValue).trim();
}

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

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

async function createBookingRequest(payload, currentUser) {
  ensureStudentRequester(currentUser);

  const { teacherId, requestedDate, startTime, endTime, studentMessage } =
    normalizeCreatePayload(payload);
  const settings = await getSystemSettings([
    'allow_same_day_booking',
    'booking_request_notification_template',
    'main_teacher_name',
  ]);

  if (!settings.allow_same_day_booking && requestedDate === getTodayDateString()) {
    throw new AppError(
      'Solicitações para o mesmo dia estão desativadas nas configurações do sistema.',
      409
    );
  }

  await ensureAdminUserTarget(teacherId);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slot = await calendarSlotModel.findByUnique(connection, {
      userId: teacherId,
      slotDate: requestedDate,
      startTime,
      endTime,
      forUpdate: true,
    });

    if (!slot) {
      throw new AppError('O slot informado não foi encontrado.', 404);
    }

    if (slot.status !== 'available') {
      throw new AppError('O slot informado não está disponível para solicitação.', 409);
    }

    const pendingRequest = await bookingRequestModel.findPendingBySlot(connection, {
      teacherId,
      requestedDate,
      startTime,
      endTime,
    });

    if (pendingRequest) {
      throw new AppError('Já existe uma solicitação pendente para este slot.', 409);
    }

    const bookingRequestId = await bookingRequestModel.createBookingRequest(connection, {
      studentId: currentUser.id,
      teacherId,
      requestedDate,
      startTime,
      endTime,
      status: 'pending',
      studentMessage,
      adminMessage: null,
    });

    await calendarSlotModel.updateById(connection, slot.id, {
      status: 'pending',
      bookingRequestId,
      bookingId: null,
    });

    await connection.commit();

    const bookingRequest = await bookingRequestModel.findById(bookingRequestId);
    const notificationMessage = renderTemplate(settings.booking_request_notification_template, {
      student_name: currentUser.name,
      date: requestedDate,
      time: startTime.slice(0, 5),
      teacher_name: settings.main_teacher_name,
    });

    return {
      ...formatBookingRequest(bookingRequest),
      notification_message: notificationMessage,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listMyBookingRequests(currentUser) {
  ensureStudentRequester(currentUser);

  const bookingRequests = await bookingRequestModel.findAll({
    studentId: currentUser.id,
  });

  return bookingRequests.map(formatBookingRequest);
}

async function listBookingRequests(query, currentUser) {
  ensureAdminRequester(currentUser);

  const filters = {};

  if (query.status !== undefined) {
    const status = String(query.status).trim();

    if (!REQUEST_STATUSES.includes(status)) {
      throw new AppError('O filtro status informado é inválido.', 400);
    }

    filters.status = status;
  }

  if (query.student_id !== undefined) {
    filters.studentId = normalizeUserId(query.student_id);
  }

  if (query.teacher_id !== undefined) {
    filters.teacherId = normalizeUserId(query.teacher_id);
  }

  if (query.requested_date !== undefined) {
    const requestedDate = String(query.requested_date).trim();

    if (!isValidDateString(requestedDate)) {
      throw new AppError(
        'O filtro requested_date deve estar no formato YYYY-MM-DD.',
        400
      );
    }

    filters.requestedDate = requestedDate;
  }

  const bookingRequests = await bookingRequestModel.findAll(filters);

  return bookingRequests.map(formatBookingRequest);
}

async function getBookingRequestById(id, currentUser) {
  const requestId = normalizeRequestId(id);
  const bookingRequest = await bookingRequestModel.findById(requestId);

  if (!bookingRequest) {
    throw new AppError('Solicitação de agendamento não encontrada.', 404);
  }

  if (currentUser.role === 'student' && bookingRequest.student_id !== currentUser.id) {
    throw new AppError('Você não tem permissão para visualizar esta solicitação.', 403);
  }

  return formatBookingRequest(bookingRequest);
}

async function approveBookingRequest(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const requestId = normalizeRequestId(id);
  const adminMessage = normalizeAdminMessage(payload);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingRequest = await bookingRequestModel.findByIdForUpdate(connection, requestId);

    if (!bookingRequest) {
      throw new AppError('Solicitação de agendamento não encontrada.', 404);
    }

    if (bookingRequest.status !== 'pending') {
      throw new AppError('A solicitação precisa estar pending para ser aprovada.', 409);
    }

    const slot = await calendarSlotModel.findByUnique(connection, {
      userId: bookingRequest.teacher_id,
      slotDate: bookingRequest.requested_date,
      startTime: bookingRequest.start_time,
      endTime: bookingRequest.end_time,
      forUpdate: true,
    });

    if (!slot) {
      throw new AppError('O slot correspondente à solicitação não foi encontrado.', 404);
    }

    if (slot.status !== 'pending' || Number(slot.booking_request_id) !== bookingRequest.id) {
      throw new AppError(
        'O slot correspondente não está reservado para esta solicitação pending.',
        409
      );
    }

    const [applicableSubscription, settings] = await Promise.all([
      subscriptionModel.findApplicableByStudentAndDate(connection, {
        studentId: bookingRequest.student_id,
        bookingDate: bookingRequest.requested_date,
      }),
      getSystemSettings(['default_max_bookings_per_day']),
    ]);

    if (!applicableSubscription) {
      throw new AppError(
        'O aluno não possui assinatura ativa com saldo disponível para esta data.',
        409
      );
    }

    const nextRemainingClasses = Number(applicableSubscription.remaining_classes) - 1;

    if (nextRemainingClasses < 0) {
      throw new AppError('A assinatura selecionada não possui saldo disponível.', 409);
    }

    const existingBookingsCount = await bookingModel.countByTeacherAndDate(connection, {
      teacherId: bookingRequest.teacher_id,
      bookingDate: bookingRequest.requested_date,
      statuses: ['confirmed', 'completed', 'no_show'],
    });

    if (existingBookingsCount >= Number(settings.default_max_bookings_per_day || 0)) {
      throw new AppError(
        'O limite diário de agendamentos configurado para o sistema foi atingido.',
        409
      );
    }

    const bookingId = await bookingModel.createBooking(connection, {
      bookingRequestId: bookingRequest.id,
      studentId: bookingRequest.student_id,
      teacherId: bookingRequest.teacher_id,
      subscriptionId: applicableSubscription.id,
      bookingDate: bookingRequest.requested_date,
      startTime: bookingRequest.start_time,
      endTime: bookingRequest.end_time,
      status: 'confirmed',
      notes: null,
    });

    await bookingRequestModel.updateById(connection, bookingRequest.id, {
      status: 'approved',
      adminMessage,
    });

    await calendarSlotModel.updateById(connection, slot.id, {
      status: 'booked',
      bookingRequestId: bookingRequest.id,
      bookingId,
    });

    await subscriptionModel.updateRemainingClassesById(
      connection,
      applicableSubscription.id,
      nextRemainingClasses
    );

    if (nextRemainingClasses === 0) {
      await subscriptionModel.updateStatusById(connection, applicableSubscription.id, 'completed');
    }

    await connection.commit();

    const updatedBookingRequest = await bookingRequestModel.findById(bookingRequest.id);
    const booking = await bookingModel.findById(bookingId);
    const updatedSubscription = await subscriptionModel.findById(applicableSubscription.id);

    return {
      booking_request: formatBookingRequest(updatedBookingRequest),
      booking: formatBooking(booking),
      subscription: formatSubscription(updatedSubscription),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function rejectBookingRequest(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const requestId = normalizeRequestId(id);
  const adminMessage = normalizeAdminMessage(payload);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingRequest = await bookingRequestModel.findByIdForUpdate(connection, requestId);

    if (!bookingRequest) {
      throw new AppError('Solicitação de agendamento não encontrada.', 404);
    }

    if (bookingRequest.status !== 'pending') {
      throw new AppError('A solicitação precisa estar pending para ser rejeitada.', 409);
    }

    const slot = await calendarSlotModel.findByUnique(connection, {
      userId: bookingRequest.teacher_id,
      slotDate: bookingRequest.requested_date,
      startTime: bookingRequest.start_time,
      endTime: bookingRequest.end_time,
      forUpdate: true,
    });

    if (!slot) {
      throw new AppError('O slot correspondente à solicitação não foi encontrado.', 404);
    }

    if (slot.status !== 'pending' || Number(slot.booking_request_id) !== bookingRequest.id) {
      throw new AppError(
        'O slot correspondente não está reservado para esta solicitação pending.',
        409
      );
    }

    await bookingRequestModel.updateById(connection, bookingRequest.id, {
      status: 'rejected',
      adminMessage,
    });

    await calendarSlotModel.updateById(connection, slot.id, {
      status: 'available',
      bookingRequestId: null,
      bookingId: null,
    });

    await connection.commit();

    const updatedBookingRequest = await bookingRequestModel.findById(bookingRequest.id);

    return formatBookingRequest(updatedBookingRequest);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelBookingRequest(id, currentUser) {
  ensureStudentRequester(currentUser);

  const requestId = normalizeRequestId(id);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingRequest = await bookingRequestModel.findByIdForUpdate(connection, requestId);

    if (!bookingRequest) {
      throw new AppError('Solicitação de agendamento não encontrada.', 404);
    }

    if (bookingRequest.student_id !== currentUser.id) {
      throw new AppError('Você não tem permissão para cancelar esta solicitação.', 403);
    }

    if (bookingRequest.status !== 'pending') {
      throw new AppError('A solicitação precisa estar pending para ser cancelada.', 409);
    }

    const slot = await calendarSlotModel.findByUnique(connection, {
      userId: bookingRequest.teacher_id,
      slotDate: bookingRequest.requested_date,
      startTime: bookingRequest.start_time,
      endTime: bookingRequest.end_time,
      forUpdate: true,
    });

    if (!slot) {
      throw new AppError('O slot correspondente à solicitação não foi encontrado.', 404);
    }

    if (slot.status !== 'pending' || Number(slot.booking_request_id) !== bookingRequest.id) {
      throw new AppError(
        'O slot correspondente não está reservado para esta solicitação pending.',
        409
      );
    }

    await bookingRequestModel.updateById(connection, bookingRequest.id, {
      status: 'cancelled',
    });

    await calendarSlotModel.updateById(connection, slot.id, {
      status: 'available',
      bookingRequestId: null,
      bookingId: null,
    });

    await connection.commit();

    const updatedBookingRequest = await bookingRequestModel.findById(bookingRequest.id);

    return formatBookingRequest(updatedBookingRequest);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createBookingRequest,
  listMyBookingRequests,
  listBookingRequests,
  getBookingRequestById,
  approveBookingRequest,
  rejectBookingRequest,
  cancelBookingRequest,
};

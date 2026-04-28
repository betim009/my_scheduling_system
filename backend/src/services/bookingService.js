const bookingModel = require('../models/bookingModel');
const calendarSlotModel = require('../models/calendarSlotModel');
const { pool } = require('../database/connection');
const AppError = require('../utils/AppError');
const { isValidDateString } = require('../utils/schedule');
const {
  isTimeRangeValid,
  normalizeTime,
} = require('../utils/schedule');
const { normalizeUserId } = require('./scheduleSupportService');

const BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed', 'no_show'];

function formatBooking(booking) {
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

function normalizeBookingId(id) {
  const bookingId = Number(id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    throw new AppError('O id do booking é inválido.', 400);
  }

  return bookingId;
}

function normalizeNotes(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  return String(value).trim();
}

function normalizeReschedulePayload(payload) {
  const newDate = String(payload?.new_date || '').trim();
  const newStartTime = normalizeTime(payload?.new_start_time);
  const newEndTime = normalizeTime(payload?.new_end_time);
  const notes = normalizeNotes(payload?.notes);

  if (!isValidDateString(newDate)) {
    throw new AppError('O campo new_date é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  }

  if (!newStartTime) {
    throw new AppError('O campo new_start_time é obrigatório.', 400);
  }

  if (!newEndTime) {
    throw new AppError('O campo new_end_time é obrigatório.', 400);
  }

  if (!isTimeRangeValid(newStartTime, newEndTime)) {
    throw new AppError('O campo new_end_time deve ser maior que new_start_time.', 400);
  }

  return {
    newDate,
    newStartTime,
    newEndTime,
    notes,
  };
}

async function listMyBookings(currentUser) {
  ensureStudentRequester(currentUser);

  const bookings = await bookingModel.findAll({
    studentId: currentUser.id,
  });

  return bookings.map(formatBooking);
}

async function listBookings(query, currentUser) {
  ensureAdminRequester(currentUser);

  const filters = {};

  if (query.student_id !== undefined) {
    filters.studentId = normalizeUserId(query.student_id);
  }

  if (query.teacher_id !== undefined) {
    filters.teacherId = normalizeUserId(query.teacher_id);
  }

  if (query.booking_date !== undefined) {
    const bookingDate = String(query.booking_date).trim();

    if (!isValidDateString(bookingDate)) {
      throw new AppError(
        'O filtro booking_date deve estar no formato YYYY-MM-DD.',
        400
      );
    }

    filters.bookingDate = bookingDate;
  }

  if (query.status !== undefined) {
    const status = String(query.status).trim();

    if (!BOOKING_STATUSES.includes(status)) {
      throw new AppError('O filtro status informado é inválido.', 400);
    }

    filters.status = status;
  }

  const bookings = await bookingModel.findAll(filters);

  return bookings.map(formatBooking);
}

async function getBookingById(id, currentUser) {
  const bookingId = normalizeBookingId(id);
  const booking = await bookingModel.findById(bookingId);

  if (!booking) {
    throw new AppError('Booking não encontrado.', 404);
  }

  if (currentUser.role === 'student' && booking.student_id !== currentUser.id) {
    throw new AppError('Você não tem permissão para visualizar este booking.', 403);
  }

  return formatBooking(booking);
}

async function cancelBooking(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const bookingId = normalizeBookingId(id);
  const notes = normalizeNotes(payload?.notes);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const booking = await bookingModel.findByIdForUpdate(connection, bookingId);

    if (!booking) {
      throw new AppError('Booking não encontrado.', 404);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Este booking já está cancelado.', 409);
    }

    const slot = await calendarSlotModel.findByUnique(connection, {
      userId: booking.teacher_id,
      slotDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      forUpdate: true,
    });

    if (!slot) {
      throw new AppError('O slot correspondente ao booking não foi encontrado.', 404);
    }

    if (slot.status !== 'booked' || Number(slot.booking_id) !== booking.id) {
      throw new AppError('O slot correspondente não está reservado para este booking.', 409);
    }

    await bookingModel.updateById(connection, booking.id, {
      status: 'cancelled',
      ...(notes !== undefined ? { notes } : {}),
    });

    await calendarSlotModel.updateById(connection, slot.id, {
      status: 'available',
      bookingRequestId: null,
      bookingId: null,
    });

    await connection.commit();

    const updatedBooking = await bookingModel.findById(booking.id);
    return formatBooking(updatedBooking);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function rescheduleBooking(id, payload, currentUser) {
  ensureAdminRequester(currentUser);

  const bookingId = normalizeBookingId(id);
  const { newDate, newStartTime, newEndTime, notes } = normalizeReschedulePayload(payload);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const booking = await bookingModel.findByIdForUpdate(connection, bookingId);

    if (!booking) {
      throw new AppError('Booking não encontrado.', 404);
    }

    if (booking.status !== 'confirmed') {
      throw new AppError('Apenas bookings confirmed podem ser reagendados.', 409);
    }

    if (
      booking.booking_date === newDate &&
      booking.start_time === newStartTime &&
      booking.end_time === newEndTime
    ) {
      throw new AppError('O novo horário deve ser diferente do booking atual.', 409);
    }

    const currentSlot = await calendarSlotModel.findByUnique(connection, {
      userId: booking.teacher_id,
      slotDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      forUpdate: true,
    });

    if (!currentSlot) {
      throw new AppError('O slot atual do booking não foi encontrado.', 404);
    }

    if (currentSlot.status !== 'booked' || Number(currentSlot.booking_id) !== booking.id) {
      throw new AppError('O slot atual não está reservado para este booking.', 409);
    }

    const nextSlot = await calendarSlotModel.findByUnique(connection, {
      userId: booking.teacher_id,
      slotDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      forUpdate: true,
    });

    if (!nextSlot) {
      throw new AppError('O novo slot informado não foi encontrado.', 404);
    }

    if (nextSlot.status !== 'available') {
      throw new AppError('O novo slot informado não está disponível.', 409);
    }

    await bookingModel.updateById(connection, booking.id, {
      status: 'cancelled',
    });

    await calendarSlotModel.updateById(connection, currentSlot.id, {
      status: 'available',
      bookingRequestId: null,
      bookingId: null,
    });

    const nextBookingId = await bookingModel.createBooking(connection, {
      bookingRequestId: null,
      studentId: booking.student_id,
      teacherId: booking.teacher_id,
      subscriptionId: booking.subscription_id,
      bookingDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'confirmed',
      notes:
        notes !== undefined
          ? notes
          : booking.notes,
    });

    await calendarSlotModel.updateById(connection, nextSlot.id, {
      status: 'booked',
      bookingRequestId: null,
      bookingId: nextBookingId,
    });

    await connection.commit();

    const cancelledBooking = await bookingModel.findById(booking.id);
    const newBooking = await bookingModel.findById(nextBookingId);

    return {
      cancelled_booking: formatBooking(cancelledBooking),
      new_booking: formatBooking(newBooking),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  listMyBookings,
  listBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
};

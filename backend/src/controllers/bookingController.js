const bookingService = require('../services/bookingService');
const { sendSuccess } = require('../utils/response');

async function listMyBookings(request, response, next) {
  try {
    const bookings = await bookingService.listMyBookings(request.user);

    return sendSuccess(response, 200, 'Bookings do aluno carregados com sucesso.', {
      bookings,
    });
  } catch (error) {
    return next(error);
  }
}

async function listBookings(request, response, next) {
  try {
    const bookings = await bookingService.listBookings(request.query, request.user);

    return sendSuccess(response, 200, 'Bookings carregados com sucesso.', {
      bookings,
    });
  } catch (error) {
    return next(error);
  }
}

async function getBookingById(request, response, next) {
  try {
    const booking = await bookingService.getBookingById(request.params.id, request.user);

    return sendSuccess(response, 200, 'Booking carregado com sucesso.', {
      booking,
    });
  } catch (error) {
    return next(error);
  }
}

async function cancelBooking(request, response, next) {
  try {
    const booking = await bookingService.cancelBooking(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Booking cancelado com sucesso.', {
      booking,
    });
  } catch (error) {
    return next(error);
  }
}

async function rescheduleBooking(request, response, next) {
  try {
    const data = await bookingService.rescheduleBooking(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Booking reagendado com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMyBookings,
  listBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
};

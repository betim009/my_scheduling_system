const bookingRequestService = require('../services/bookingRequestService');
const { sendSuccess } = require('../utils/response');

async function createBookingRequest(request, response, next) {
  try {
    const bookingRequest = await bookingRequestService.createBookingRequest(
      request.body,
      request.user
    );

    return sendSuccess(response, 201, 'Solicitação de agendamento criada com sucesso.', {
      booking_request: bookingRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function listMyBookingRequests(request, response, next) {
  try {
    const bookingRequests = await bookingRequestService.listMyBookingRequests(request.user);

    return sendSuccess(response, 200, 'Solicitações do aluno carregadas com sucesso.', {
      booking_requests: bookingRequests,
    });
  } catch (error) {
    return next(error);
  }
}

async function listBookingRequests(request, response, next) {
  try {
    const bookingRequests = await bookingRequestService.listBookingRequests(
      request.query,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitações de agendamento carregadas com sucesso.', {
      booking_requests: bookingRequests,
    });
  } catch (error) {
    return next(error);
  }
}

async function getBookingRequestById(request, response, next) {
  try {
    const bookingRequest = await bookingRequestService.getBookingRequestById(
      request.params.id,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação de agendamento carregada com sucesso.', {
      booking_request: bookingRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function approveBookingRequest(request, response, next) {
  try {
    const data = await bookingRequestService.approveBookingRequest(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação aprovada com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function rejectBookingRequest(request, response, next) {
  try {
    const bookingRequest = await bookingRequestService.rejectBookingRequest(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação rejeitada com sucesso.', {
      booking_request: bookingRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function cancelBookingRequest(request, response, next) {
  try {
    const bookingRequest = await bookingRequestService.cancelBookingRequest(
      request.params.id,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação cancelada com sucesso.', {
      booking_request: bookingRequest,
    });
  } catch (error) {
    return next(error);
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

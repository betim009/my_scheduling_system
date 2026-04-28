const availabilityExceptionService = require('../services/availabilityExceptionService');
const { sendSuccess } = require('../utils/response');

async function createException(request, response, next) {
  try {
    const exception = await availabilityExceptionService.createException(request.body, request.user);

    return sendSuccess(response, 201, 'Exceção de disponibilidade criada com sucesso.', {
      exception,
    });
  } catch (error) {
    return next(error);
  }
}

async function listExceptions(request, response, next) {
  try {
    const exceptions = await availabilityExceptionService.listExceptions(request.query, request.user);

    return sendSuccess(response, 200, 'Exceções de disponibilidade carregadas com sucesso.', {
      exceptions,
    });
  } catch (error) {
    return next(error);
  }
}

async function getExceptionById(request, response, next) {
  try {
    const exception = await availabilityExceptionService.getExceptionById(request.params.id, request.user);

    return sendSuccess(response, 200, 'Exceção de disponibilidade carregada com sucesso.', {
      exception,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateException(request, response, next) {
  try {
    const exception = await availabilityExceptionService.updateException(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Exceção de disponibilidade atualizada com sucesso.', {
      exception,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteException(request, response, next) {
  try {
    await availabilityExceptionService.deleteException(request.params.id, request.user);

    return sendSuccess(response, 200, 'Exceção de disponibilidade removida com sucesso.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createException,
  listExceptions,
  getExceptionById,
  updateException,
  deleteException,
};

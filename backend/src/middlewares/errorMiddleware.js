const AppError = require('../utils/AppError');

function notFoundHandler(request, _response, next) {
  next(new AppError(`Rota não encontrada: ${request.method} ${request.originalUrl}`, 404));
}

function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return response.status(409).json({
      success: false,
      message: 'Já existe um registro com um valor único informado.',
    });
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: 'Erro interno do servidor.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

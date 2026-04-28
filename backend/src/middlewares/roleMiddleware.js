const AppError = require('../utils/AppError');

function authorizeRoles(...allowedRoles) {
  return (request, _response, next) => {
    if (!request.user) {
      return next(new AppError('Usuário não autenticado.', 401));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};

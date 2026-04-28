const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

async function register(request, response, next) {
  try {
    const data = await authService.register(request.body);

    return sendSuccess(response, 201, 'Usuário cadastrado com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  try {
    const data = await authService.login(request.body);

    return sendSuccess(response, 200, 'Login realizado com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function getMe(request, response, next) {
  try {
    const user = await authService.getAuthenticatedUser(request.user.id);

    return sendSuccess(response, 200, 'Usuário autenticado carregado com sucesso.', {
      user,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAdminArea(request, response, next) {
  try {
    return sendSuccess(response, 200, 'Acesso de admin autorizado.', {
      user: request.user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  getAdminArea,
};

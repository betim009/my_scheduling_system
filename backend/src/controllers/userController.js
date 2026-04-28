const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

async function listUsers(request, response, next) {
  try {
    const users = await userService.listUsers(request.query, request.user);

    return sendSuccess(response, 200, 'Usuários carregados com sucesso.', {
      users,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCurrentUser(request, response, next) {
  try {
    const user = await userService.updateCurrentUser(request.body, request.user);

    return sendSuccess(response, 200, 'Perfil atualizado com sucesso.', {
      user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  updateCurrentUser,
};

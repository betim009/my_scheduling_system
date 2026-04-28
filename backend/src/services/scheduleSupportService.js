const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

function normalizeUserId(userId) {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    throw new AppError('O campo user_id é obrigatório e deve ser um número inteiro positivo.', 400);
  }

  return parsedUserId;
}

async function ensureAdminUserTarget(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const user = await userModel.findById(normalizedUserId);

  if (!user) {
    throw new AppError('Usuário informado não foi encontrado.', 404);
  }

  if (user.role !== 'admin') {
    throw new AppError('A agenda só pode ser configurada para usuários admin.', 400);
  }

  return user;
}

module.exports = {
  normalizeUserId,
  ensureAdminUserTarget,
};

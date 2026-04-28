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

async function findSingleAdminUser() {
  const admins = await userModel.findAll({ role: 'admin' });
  const firstAdmin = admins[0];

  if (!firstAdmin) {
    throw new AppError('Nenhum professor/admin foi encontrado.', 404);
  }

  return firstAdmin;
}

async function resolveAdminUserId({ requestedUserId, currentUser, requireCurrentAdmin = false }) {
  const hasRequestedUserId =
    requestedUserId !== undefined && requestedUserId !== null && requestedUserId !== '';

  if (currentUser?.role === 'admin') {
    const currentUserId = normalizeUserId(currentUser.id);

    if (!hasRequestedUserId) {
      return currentUserId;
    }

    const normalizedUserId = normalizeUserId(requestedUserId);

    if (normalizedUserId !== currentUserId) {
      throw new AppError('Não é permitido manipular agenda de outro usuário.', 403);
    }

    await ensureAdminUserTarget(normalizedUserId);
    return normalizedUserId;
  }

  if (requireCurrentAdmin) {
    throw new AppError('Você não tem permissão para configurar a agenda.', 403);
  }

  if (hasRequestedUserId) {
    const user = await ensureAdminUserTarget(requestedUserId);
    return user.id;
  }

  const admin = await findSingleAdminUser();
  return admin.id;
}

module.exports = {
  normalizeUserId,
  ensureAdminUserTarget,
  findSingleAdminUser,
  resolveAdminUserId,
};

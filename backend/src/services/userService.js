const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { sanitizeUser } = require('../utils/user');

const ALLOWED_ROLES = ['admin', 'student'];
const PASSWORD_SALT_ROUNDS = 10;

function ensureAdminRequester(currentUser) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Apenas admins podem executar esta operação.', 403);
  }
}

function sanitizeListUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

async function listUsers(query, currentUser) {
  ensureAdminRequester(currentUser);

  const filters = {};

  if (query.role !== undefined) {
    const role = String(query.role).trim();

    if (!ALLOWED_ROLES.includes(role)) {
      throw new AppError('O filtro role informado é inválido.', 400);
    }

    filters.role = role;
  }

  const users = await userModel.findAll(filters);

  return users.map(sanitizeListUser);
}

function normalizeOptionalString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  return String(value).trim();
}

async function updateCurrentUser(payload, currentUser) {
  const existingUser = await userModel.findById(currentUser.id);

  if (!existingUser) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const nextName = normalizeOptionalString(payload.name);
  const nextUsername = normalizeOptionalString(payload.username);
  const nextEmail = normalizeOptionalString(payload.email)?.toLowerCase();
  const nextPhone = normalizeOptionalString(payload.phone);
  const nextPassword = payload.password === undefined ? undefined : String(payload.password || '');

  if (nextName !== undefined && !nextName) {
    throw new AppError('O campo name não pode ficar vazio.', 400);
  }

  if (nextUsername !== undefined && !nextUsername) {
    throw new AppError('O campo username não pode ficar vazio.', 400);
  }

  if (nextEmail !== undefined && !nextEmail) {
    throw new AppError('O campo email não pode ficar vazio.', 400);
  }

  if (nextPassword !== undefined && nextPassword.trim() !== '' && nextPassword.length < 6) {
    throw new AppError('A senha deve ter pelo menos 6 caracteres.', 400);
  }

  if (nextEmail && nextEmail !== existingUser.email) {
    const userByEmail = await userModel.findByEmail(nextEmail);

    if (userByEmail && userByEmail.id !== existingUser.id) {
      throw new AppError('Já existe um usuário com este email.', 409);
    }
  }

  if (nextUsername && nextUsername !== existingUser.username) {
    const userByUsername = await userModel.findByUsername(nextUsername);

    if (userByUsername && userByUsername.id !== existingUser.id) {
      throw new AppError('Já existe um usuário com este username.', 409);
    }
  }

  const updates = {
    ...(nextName !== undefined ? { name: nextName } : {}),
    ...(nextUsername !== undefined ? { username: nextUsername } : {}),
    ...(nextEmail !== undefined ? { email: nextEmail } : {}),
    ...(nextPhone !== undefined ? { phone: nextPhone } : {}),
  };

  if (nextPassword !== undefined && nextPassword.trim() !== '') {
    updates.password = await bcrypt.hash(nextPassword, PASSWORD_SALT_ROUNDS);
  }

  await userModel.updateById(existingUser.id, updates);

  const updatedUser = await userModel.findById(existingUser.id);

  return sanitizeUser(updatedUser);
}

module.exports = {
  listUsers,
  updateCurrentUser,
};

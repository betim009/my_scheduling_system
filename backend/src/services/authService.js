const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { jwt: jwtConfig } = require('../config/env');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { sanitizeUser } = require('../utils/user');

const ALLOWED_ROLES = ['admin', 'student'];
const PASSWORD_SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      email: user.email,
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
    }
  );
}

function normalizeRegisterPayload(payload) {
  const name = String(payload.name || '').trim();
  const username = String(payload.username || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const role = String(payload.role || '').trim().toLowerCase();
  const phone = payload.phone ? String(payload.phone).trim() : null;

  if (!name) {
    throw new AppError('O campo name é obrigatório.', 400);
  }

  if (!username) {
    throw new AppError('O campo username é obrigatório.', 400);
  }

  if (!email) {
    throw new AppError('O campo email é obrigatório.', 400);
  }

  if (!password.trim()) {
    throw new AppError('O campo password é obrigatório.', 400);
  }

  if (!role) {
    throw new AppError('O campo role é obrigatório.', 400);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError('O campo role deve ser admin ou student.', 400);
  }

  if (role !== 'student') {
    throw new AppError('O cadastro público só permite criar contas do tipo student.', 403);
  }

  return {
    name,
    username,
    email,
    password,
    role,
    phone: phone || null,
  };
}

function normalizeLoginPayload(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!email) {
    throw new AppError('O campo email é obrigatório.', 400);
  }

  if (!password.trim()) {
    throw new AppError('O campo password é obrigatório.', 400);
  }

  return {
    email,
    password,
  };
}

async function register(payload) {
  const userData = normalizeRegisterPayload(payload);

  const userByEmail = await userModel.findByEmail(userData.email);
  if (userByEmail) {
    throw new AppError('Já existe um usuário com este email.', 409);
  }

  const userByUsername = await userModel.findByUsername(userData.username);
  if (userByUsername) {
    throw new AppError('Já existe um usuário com este username.', 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, PASSWORD_SALT_ROUNDS);

  const userId = await userModel.createUser({
    ...userData,
    password: hashedPassword,
  });

  const createdUser = await userModel.findById(userId);
  const safeUser = sanitizeUser(createdUser);

  return {
    token: generateToken(createdUser),
    user: safeUser,
  };
}

async function login(payload) {
  const { email, password } = normalizeLoginPayload(payload);
  const user = await userModel.findByEmail(email);

  if (!user) {
    throw new AppError('Email ou senha inválidos.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Email ou senha inválidos.', 401);
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user),
  };
}

async function getAuthenticatedUser(userId) {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new AppError('Usuário autenticado não encontrado.', 404);
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getAuthenticatedUser,
};

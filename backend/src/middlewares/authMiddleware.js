const jwt = require('jsonwebtoken');

const { jwt: jwtConfig } = require('../config/env');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { sanitizeUser } = require('../utils/user');

async function authenticate(request, _response, next) {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new AppError('Token de autenticação não informado.', 401);
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
      throw new AppError('Formato do token inválido. Use Bearer Token.', 401);
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Token de autenticação não informado.', 401);
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado.', 401);
      }

      throw new AppError('Token inválido.', 401);
    }

    const userId = Number(decodedToken.sub);

    if (!userId) {
      throw new AppError('Token inválido.', 401);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new AppError('Usuário do token não encontrado.', 401);
    }

    request.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticate,
};

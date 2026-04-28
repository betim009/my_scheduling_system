const systemSettingService = require('../services/systemSettingService');
const { sendSuccess } = require('../utils/response');

async function listPublicSettings(_request, response, next) {
  try {
    const settings = await systemSettingService.listPublicSettings();

    return sendSuccess(response, 200, 'Configurações públicas carregadas com sucesso.', {
      settings,
    });
  } catch (error) {
    return next(error);
  }
}

async function listSettings(request, response, next) {
  try {
    const settings = await systemSettingService.listSettings(request.user);

    return sendSuccess(response, 200, 'Configurações carregadas com sucesso.', {
      settings,
    });
  } catch (error) {
    return next(error);
  }
}

async function getSettingByKey(request, response, next) {
  try {
    const setting = await systemSettingService.getSettingByKey(
      request.params.key,
      request.user
    );

    return sendSuccess(response, 200, 'Configuração carregada com sucesso.', {
      setting,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSetting(request, response, next) {
  try {
    const setting = await systemSettingService.updateSetting(
      request.params.key,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Configuração atualizada com sucesso.', {
      setting,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateManySettings(request, response, next) {
  try {
    const settings = await systemSettingService.updateManySettings(
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Configurações atualizadas com sucesso.', {
      settings,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPublicSettings,
  listSettings,
  getSettingByKey,
  updateSetting,
  updateManySettings,
};

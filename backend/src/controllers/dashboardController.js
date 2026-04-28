const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

async function getAdminSummary(request, response, next) {
  try {
    const summary = await dashboardService.getAdminSummary();

    return sendSuccess(response, 200, 'Resumo administrativo carregado com sucesso.', summary);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAdminSummary,
};

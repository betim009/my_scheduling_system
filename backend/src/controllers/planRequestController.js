const planRequestService = require('../services/planRequestService');
const { sendSuccess } = require('../utils/response');

async function createPlanRequest(request, response, next) {
  try {
    const data = await planRequestService.createPlanRequest(request.body, request.user);

    return sendSuccess(response, 201, 'Solicitação de plano criada com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function listPlanRequests(request, response, next) {
  try {
    const planRequests = await planRequestService.listPlanRequests(request.query, request.user);

    return sendSuccess(response, 200, 'Solicitações de planos carregadas com sucesso.', {
      plan_requests: planRequests,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPlanRequestById(request, response, next) {
  try {
    const planRequest = await planRequestService.getPlanRequestById(
      request.params.id,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação de plano carregada com sucesso.', {
      plan_request: planRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function approvePlanRequest(request, response, next) {
  try {
    const data = await planRequestService.approvePlanRequest(request.params.id, request.user);

    return sendSuccess(response, 200, 'Solicitação de plano aprovada com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function rejectPlanRequest(request, response, next) {
  try {
    const planRequest = await planRequestService.rejectPlanRequest(
      request.params.id,
      request.user
    );

    return sendSuccess(response, 200, 'Solicitação de plano rejeitada com sucesso.', {
      plan_request: planRequest,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPlanRequest,
  listPlanRequests,
  getPlanRequestById,
  approvePlanRequest,
  rejectPlanRequest,
};

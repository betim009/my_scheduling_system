const planService = require('../services/planService');
const { sendSuccess } = require('../utils/response');

async function createPlan(request, response, next) {
  try {
    const plan = await planService.createPlan(request.body, request.user);

    return sendSuccess(response, 201, 'Plano criado com sucesso.', {
      plan,
    });
  } catch (error) {
    return next(error);
  }
}

async function listPlans(request, response, next) {
  try {
    const plans = await planService.listPlans(request.user);

    return sendSuccess(response, 200, 'Planos carregados com sucesso.', {
      plans,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPlanById(request, response, next) {
  try {
    const plan = await planService.getPlanById(request.params.id, request.user);

    return sendSuccess(response, 200, 'Plano carregado com sucesso.', {
      plan,
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePlan(request, response, next) {
  try {
    const plan = await planService.updatePlan(request.params.id, request.body, request.user);

    return sendSuccess(response, 200, 'Plano atualizado com sucesso.', {
      plan,
    });
  } catch (error) {
    return next(error);
  }
}

async function togglePlanActive(request, response, next) {
  try {
    const plan = await planService.togglePlanActive(request.params.id, request.body, request.user);

    return sendSuccess(response, 200, 'Status do plano atualizado com sucesso.', {
      plan,
    });
  } catch (error) {
    return next(error);
  }
}

async function deletePlan(request, response, next) {
  try {
    const plan = await planService.deletePlan(request.params.id, request.user);

    return sendSuccess(response, 200, 'Plano removido com sucesso.', {
      plan,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  togglePlanActive,
  deletePlan,
};

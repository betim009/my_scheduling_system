const subscriptionService = require('../services/subscriptionService');
const { sendSuccess } = require('../utils/response');

async function createSubscription(request, response, next) {
  try {
    const subscription = await subscriptionService.createSubscription(request.body, request.user);

    return sendSuccess(response, 201, 'Assinatura criada com sucesso.', {
      subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function listSubscriptions(request, response, next) {
  try {
    const subscriptions = await subscriptionService.listSubscriptions(request.query, request.user);

    return sendSuccess(response, 200, 'Assinaturas carregadas com sucesso.', {
      subscriptions,
    });
  } catch (error) {
    return next(error);
  }
}

async function listMySubscriptions(request, response, next) {
  try {
    const subscriptions = await subscriptionService.listMySubscriptions(request.user);

    return sendSuccess(response, 200, 'Assinaturas do aluno carregadas com sucesso.', {
      subscriptions,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMySubscriptionsSummary(request, response, next) {
  try {
    const summary = await subscriptionService.getMySubscriptionsSummary(request.user);

    return sendSuccess(response, 200, 'Resumo das assinaturas carregado com sucesso.', summary);
  } catch (error) {
    return next(error);
  }
}

async function getSubscriptionById(request, response, next) {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      request.params.id,
      request.user
    );

    return sendSuccess(response, 200, 'Assinatura carregada com sucesso.', {
      subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSubscription(request, response, next) {
  try {
    const subscription = await subscriptionService.updateSubscription(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Assinatura atualizada com sucesso.', {
      subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSubscriptionStatus(request, response, next) {
  try {
    const subscription = await subscriptionService.updateSubscriptionStatus(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Status da assinatura atualizado com sucesso.', {
      subscription,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateRemainingClasses(request, response, next) {
  try {
    const subscription = await subscriptionService.updateRemainingClasses(
      request.params.id,
      request.body,
      request.user
    );

    return sendSuccess(response, 200, 'Saldo de aulas atualizado com sucesso.', {
      subscription,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createSubscription,
  listSubscriptions,
  listMySubscriptions,
  getMySubscriptionsSummary,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionStatus,
  updateRemainingClasses,
};

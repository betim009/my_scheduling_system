const availabilityRuleService = require('../services/availabilityRuleService');
const { sendSuccess } = require('../utils/response');

async function createRule(request, response, next) {
  try {
    const rule = await availabilityRuleService.createRule(request.body, request.user);

    return sendSuccess(response, 201, 'Regra de disponibilidade criada com sucesso.', {
      rule,
    });
  } catch (error) {
    return next(error);
  }
}

async function listRules(request, response, next) {
  try {
    const rules = await availabilityRuleService.listRules(request.query, request.user);

    return sendSuccess(response, 200, 'Regras de disponibilidade carregadas com sucesso.', {
      rules,
    });
  } catch (error) {
    return next(error);
  }
}

async function getRuleById(request, response, next) {
  try {
    const rule = await availabilityRuleService.getRuleById(request.params.id, request.user);

    return sendSuccess(response, 200, 'Regra de disponibilidade carregada com sucesso.', {
      rule,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateRule(request, response, next) {
  try {
    const rule = await availabilityRuleService.updateRule(request.params.id, request.body, request.user);

    return sendSuccess(response, 200, 'Regra de disponibilidade atualizada com sucesso.', {
      rule,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteRule(request, response, next) {
  try {
    await availabilityRuleService.deleteRule(request.params.id, request.user);

    return sendSuccess(response, 200, 'Regra de disponibilidade removida com sucesso.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createRule,
  listRules,
  getRuleById,
  updateRule,
  deleteRule,
};

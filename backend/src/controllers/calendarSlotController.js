const calendarSlotService = require('../services/calendarSlotService');
const { sendSuccess } = require('../utils/response');

async function generateSlots(request, response, next) {
  try {
    const generationSummary = await calendarSlotService.generateSlots(request.body, request.user);

    return sendSuccess(response, 200, 'Slots de calendário gerados com sucesso.', {
      generation_summary: generationSummary,
    });
  } catch (error) {
    return next(error);
  }
}

async function listSlotsByMonth(request, response, next) {
  try {
    const data = await calendarSlotService.listSlotsByMonth(request.query, request.user);

    return sendSuccess(response, 200, 'Slots do mês carregados com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function listSlotsByDay(request, response, next) {
  try {
    const data = await calendarSlotService.listSlotsByDay(request.query, request.user);

    return sendSuccess(response, 200, 'Slots do dia carregados com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function listPublicSlotsByMonth(request, response, next) {
  try {
    const data = await calendarSlotService.listPublicSlotsByMonth(request.query);

    return sendSuccess(response, 200, 'Slots públicos do mês carregados com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

async function listPublicSlotsByDay(request, response, next) {
  try {
    const data = await calendarSlotService.listPublicSlotsByDay(request.query);

    return sendSuccess(response, 200, 'Slots públicos do dia carregados com sucesso.', data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generateSlots,
  listSlotsByMonth,
  listSlotsByDay,
  listPublicSlotsByMonth,
  listPublicSlotsByDay,
};

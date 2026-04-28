const availabilityExceptionModel = require('../models/availabilityExceptionModel');
const availabilityRuleModel = require('../models/availabilityRuleModel');
const calendarSlotModel = require('../models/calendarSlotModel');
const userModel = require('../models/userModel');
const { pool } = require('../database/connection');
const AppError = require('../utils/AppError');
const {
  DEFAULT_SLOT_DURATION_MINUTES,
  doTimeRangesOverlap,
  generateTimeSlots,
  getDatabaseWeekdayFromDate,
  getDatesBetween,
  getMonthDateRange,
  isValidDateString,
  minutesToTime,
  normalizeTime,
  timeToMinutes,
} = require('../utils/schedule');
const { ensureAdminUserTarget, normalizeUserId } = require('./scheduleSupportService');
const { getSystemSetting, getSystemSettings } = require('./systemSettingsRuntimeService');

function formatSlot(slot) {
  return {
    id: slot.id,
    user_id: slot.user_id,
    slot_date: slot.slot_date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.status,
    booking_request_id: slot.booking_request_id,
    booking_id: slot.booking_id,
    source: slot.source,
    created_at: slot.created_at,
    updated_at: slot.updated_at,
  };
}

function formatPublicSlot(slot) {
  return {
    slot_date: slot.slot_date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.status,
  };
}

function ensureCalendarViewer(currentUser) {
  if (!currentUser || !['admin', 'student'].includes(currentUser.role)) {
    throw new AppError('Você não tem permissão para visualizar os slots.', 403);
  }
}

async function resolvePublicCalendarUserId(query) {
  if (query.user_id !== undefined && query.user_id !== null && query.user_id !== '') {
    const userId = normalizeUserId(query.user_id);
    await ensureAdminUserTarget(userId);
    return userId;
  }

  const admins = await userModel.findAll({ role: 'admin' });
  const firstAdmin = admins[0];

  if (!firstAdmin) {
    throw new AppError('Nenhum professor/admin foi encontrado para exibir a agenda pública.', 404);
  }

  return firstAdmin.id;
}

function addSlotToMap(slotMap, slot) {
  const key = `${slot.start_time}-${slot.end_time}`;
  const currentSlot = slotMap.get(key);

  if (!currentSlot || slot.source === 'exception') {
    slotMap.set(key, slot);
  }
}

function buildRuleSlots(rules) {
  const slotMap = new Map();

  for (const rule of rules) {
    const generatedSlots = generateTimeSlots(
      rule.start_time,
      rule.end_time,
      Number(rule.slot_duration_minutes),
      'rule'
    );

    for (const slot of generatedSlots) {
      addSlotToMap(slotMap, slot);
    }
  }

  return slotMap;
}

function filterExcludedSlots(slotMap, excludedHours) {
  if (!excludedHours.length) {
    return slotMap;
  }

  const excludedSet = new Set(excludedHours);
  const filteredEntries = [...slotMap.entries()].filter(([, slot]) => {
    return !excludedSet.has(slot.start_time.slice(0, 5));
  });

  return new Map(filteredEntries);
}

function buildFallbackSlotsForWeekday({
  weekday,
  fallbackSlotDurationMinutes,
  defaultWeekdayStartTime,
  defaultWeekdayEndTime,
  defaultExcludedHours,
  defaultSaturdayHours,
}) {
  if (weekday >= 0 && weekday <= 4) {
    const normalizedStartTime = normalizeTime(defaultWeekdayStartTime);
    const normalizedEndTime = normalizeTime(defaultWeekdayEndTime);

    if (!normalizedStartTime || !normalizedEndTime) {
      return new Map();
    }

    const slotMap = new Map();
    const generatedSlots = generateTimeSlots(
      normalizedStartTime,
      normalizedEndTime,
      fallbackSlotDurationMinutes,
      'manual'
    );

    for (const slot of generatedSlots) {
      addSlotToMap(slotMap, slot);
    }

    return filterExcludedSlots(slotMap, defaultExcludedHours);
  }

  if (weekday === 5) {
    const slotMap = new Map();

    for (const hour of defaultSaturdayHours) {
      const normalizedStartTime = normalizeTime(hour);
      const startMinutes = timeToMinutes(normalizedStartTime);

      if (!normalizedStartTime || startMinutes === null) {
        continue;
      }

      addSlotToMap(slotMap, {
        start_time: normalizedStartTime,
        end_time: minutesToTime(startMinutes + fallbackSlotDurationMinutes),
        source: 'manual',
      });
    }

    return slotMap;
  }

  return new Map();
}

function applyBlockTimeRanges(slotMap, exceptions) {
  const filteredEntries = [...slotMap.entries()].filter(([, slot]) => {
    return !exceptions.some((exception) =>
      doTimeRangesOverlap(
        slot.start_time,
        slot.end_time,
        exception.start_time,
        exception.end_time
      )
    );
  });

  return new Map(filteredEntries);
}

function applyExtraTimeRanges(slotMap, exceptions, slotDurationMinutes) {
  const nextSlotMap = new Map(slotMap);

  for (const exception of exceptions) {
    const generatedSlots = generateTimeSlots(
      exception.start_time,
      exception.end_time,
      slotDurationMinutes,
      'exception'
    );

    for (const slot of generatedSlots) {
      addSlotToMap(nextSlotMap, slot);
    }
  }

  return nextSlotMap;
}

function buildCustomSlots(exceptions, slotDurationMinutes) {
  const slotMap = new Map();

  for (const exception of exceptions) {
    const generatedSlots = generateTimeSlots(
      exception.start_time,
      exception.end_time,
      slotDurationMinutes,
      'exception'
    );

    for (const slot of generatedSlots) {
      addSlotToMap(slotMap, slot);
    }
  }

  return slotMap;
}

function buildDailySlots({
  rules,
  exceptions,
  fallbackSlotDurationMinutes,
  weekday,
  defaults,
}) {
  const hasBlockFullDay = exceptions.some((exception) => exception.type === 'block_full_day');

  if (hasBlockFullDay) {
    return [];
  }

  const customExceptions = exceptions.filter((exception) => exception.type === 'custom_time_range');
  const blockExceptions = exceptions.filter((exception) => exception.type === 'block_time_range');
  const extraExceptions = exceptions.filter((exception) => exception.type === 'extra_time_range');

  let slotMap;

  if (customExceptions.length) {
    slotMap = buildCustomSlots(customExceptions, fallbackSlotDurationMinutes);
  } else if (rules.length) {
    slotMap = buildRuleSlots(rules);
  } else {
    slotMap = buildFallbackSlotsForWeekday({
      weekday,
      fallbackSlotDurationMinutes,
      defaultWeekdayStartTime: defaults.defaultWeekdayStartTime,
      defaultWeekdayEndTime: defaults.defaultWeekdayEndTime,
      defaultExcludedHours: defaults.defaultExcludedHours,
      defaultSaturdayHours: defaults.defaultSaturdayHours,
    });
  }

  if (blockExceptions.length) {
    slotMap = applyBlockTimeRanges(slotMap, blockExceptions);
  }

  if (extraExceptions.length) {
    slotMap = applyExtraTimeRanges(slotMap, extraExceptions, fallbackSlotDurationMinutes);
  }

  return [...slotMap.values()].sort((leftSlot, rightSlot) =>
    leftSlot.start_time.localeCompare(rightSlot.start_time)
  );
}

function groupRulesByWeekday(rules) {
  return rules.reduce((rulesByWeekday, rule) => {
    const weekday = Number(rule.weekday);

    if (!rulesByWeekday.has(weekday)) {
      rulesByWeekday.set(weekday, []);
    }

    rulesByWeekday.get(weekday).push(rule);
    return rulesByWeekday;
  }, new Map());
}

function groupExceptionsByDate(exceptions) {
  return exceptions.reduce((exceptionsByDate, exception) => {
    if (!exceptionsByDate.has(exception.exception_date)) {
      exceptionsByDate.set(exception.exception_date, []);
    }

    exceptionsByDate.get(exception.exception_date).push(exception);
    return exceptionsByDate;
  }, new Map());
}

async function normalizeGenerationPayload(payload) {
  const userId = normalizeUserId(payload.user_id);
  const startDate = String(payload.start_date || '').trim();
  const endDate = String(payload.end_date || '').trim();

  if (!isValidDateString(startDate)) {
    throw new AppError('O campo start_date é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  }

  if (!isValidDateString(endDate)) {
    throw new AppError('O campo end_date é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  }

  if (startDate > endDate) {
    throw new AppError('start_date não pode ser maior que end_date.', 400);
  }

  await ensureAdminUserTarget(userId);

  return {
    userId,
    startDate,
    endDate,
  };
}

async function generateSlots(payload) {
  const { userId, startDate, endDate } = await normalizeGenerationPayload(payload);
  const fallbackSlotDurationMinutes = Number(
    await getSystemSetting('default_slot_duration_minutes', {
      fallback: DEFAULT_SLOT_DURATION_MINUTES,
    })
  );
  const defaults = await getSystemSettings([
    'default_weekday_start_time',
    'default_weekday_end_time',
    'default_excluded_hours',
    'default_saturday_hours',
  ]);
  const rules = await availabilityRuleModel.findActiveByUser(userId);
  const exceptions = await availabilityExceptionModel.findByUserAndDateRange(
    userId,
    startDate,
    endDate
  );
  const rulesByWeekday = groupRulesByWeekday(rules);
  const exceptionsByDate = groupExceptionsByDate(exceptions);
  const dates = getDatesBetween(startDate, endDate);
  const generatedSlots = [];

  for (const date of dates) {
    const weekday = getDatabaseWeekdayFromDate(date);
    const dailyRules = rulesByWeekday.get(weekday) || [];
    const dailyExceptions = exceptionsByDate.get(date) || [];
    const dailySlots = buildDailySlots({
      rules: dailyRules,
      exceptions: dailyExceptions,
      fallbackSlotDurationMinutes,
      weekday,
      defaults: {
        defaultWeekdayStartTime: defaults.default_weekday_start_time,
        defaultWeekdayEndTime: defaults.default_weekday_end_time,
        defaultExcludedHours: Array.isArray(defaults.default_excluded_hours)
          ? defaults.default_excluded_hours
          : [],
        defaultSaturdayHours: Array.isArray(defaults.default_saturday_hours)
          ? defaults.default_saturday_hours
          : [],
      },
    });

    for (const slot of dailySlots) {
      generatedSlots.push({
        user_id: userId,
        slot_date: date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: 'available',
        source: slot.source,
      });
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await calendarSlotModel.deleteByUserAndDateRange(connection, {
      userId,
      startDate,
      endDate,
    });
    const protectedSlots = await calendarSlotModel.findByDateRange({
      userId,
      startDate,
      endDate,
    }, connection);
    const protectedSlotKeys = new Set(
      protectedSlots.map(
        (slot) => `${slot.user_id}-${slot.slot_date}-${slot.start_time}-${slot.end_time}`
      )
    );
    const slotsToInsert = generatedSlots.filter((slot) => {
      const slotKey = `${slot.user_id}-${slot.slot_date}-${slot.start_time}-${slot.end_time}`;

      return !protectedSlotKeys.has(slotKey);
    });

    await calendarSlotModel.insertMany(connection, slotsToInsert);
    await connection.commit();

    return {
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      default_slot_duration_minutes: fallbackSlotDurationMinutes,
      total_days_processed: dates.length,
      generated_slots_count: generatedSlots.length,
      inserted_slots_count: slotsToInsert.length,
      preserved_slots_count: protectedSlots.length,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listSlotsByMonth(query, currentUser) {
  ensureCalendarViewer(currentUser);

  const userId = normalizeUserId(query.user_id);
  const month = String(query.month || '').trim();
  const monthDateRange = getMonthDateRange(month);

  if (!monthDateRange) {
    throw new AppError('O filtro month é obrigatório e deve estar no formato YYYY-MM.', 400);
  }

  await ensureAdminUserTarget(userId);

  const statuses = currentUser.role === 'student' ? ['available'] : [];
  const slots = await calendarSlotModel.findByDateRange({
    userId,
    startDate: monthDateRange.startDate,
    endDate: monthDateRange.endDate,
    statuses,
  });

  return {
    user_id: userId,
    month,
    slots: slots.map(formatSlot),
  };
}

async function listSlotsByDay(query, currentUser) {
  ensureCalendarViewer(currentUser);

  const userId = normalizeUserId(query.user_id);
  const date = String(query.date || '').trim();

  if (!isValidDateString(date)) {
    throw new AppError('O filtro date é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  }

  await ensureAdminUserTarget(userId);

  const statuses = currentUser.role === 'student' ? ['available'] : [];
  const slots = await calendarSlotModel.findByDate({
    userId,
    date,
    statuses,
  });

  return {
    user_id: userId,
    date,
    slots: slots.map(formatSlot),
  };
}

async function listPublicSlotsByMonth(query) {
  const userId = await resolvePublicCalendarUserId(query);
  const month = String(query.month || '').trim();
  const monthDateRange = getMonthDateRange(month);

  if (!monthDateRange) {
    throw new AppError('O filtro month é obrigatório e deve estar no formato YYYY-MM.', 400);
  }

  const slots = await calendarSlotModel.findByDateRange({
    userId,
    startDate: monthDateRange.startDate,
    endDate: monthDateRange.endDate,
    statuses: ['available'],
  });

  return {
    month,
    slots: slots.map(formatPublicSlot),
  };
}

async function listPublicSlotsByDay(query) {
  const userId = await resolvePublicCalendarUserId(query);
  const date = String(query.date || '').trim();

  if (!isValidDateString(date)) {
    throw new AppError('O filtro date é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  }

  const slots = await calendarSlotModel.findByDate({
    userId,
    date,
    statuses: ['available'],
  });

  return {
    date,
    slots: slots.map(formatPublicSlot),
  };
}

module.exports = {
  generateSlots,
  listSlotsByMonth,
  listSlotsByDay,
  listPublicSlotsByMonth,
  listPublicSlotsByDay,
};

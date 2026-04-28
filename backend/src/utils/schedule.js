const DEFAULT_SLOT_DURATION_MINUTES = 60;

function normalizeTime(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const match = String(value)
    .trim()
    .match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

  if (!match) {
    return null;
  }

  const [, hours, minutes] = match;

  return `${hours}:${minutes}:00`;
}

function timeToMinutes(value) {
  const normalizedTime = normalizeTime(value);

  if (!normalizedTime) {
    return null;
  }

  const [hours, minutes] = normalizedTime.split(':').map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}:00`;
}

function isTimeRangeValid(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return startMinutes !== null && endMinutes !== null && startMinutes < endMinutes;
}

function generateTimeSlots(startTime, endTime, slotDurationMinutes, source = 'rule') {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (
    startMinutes === null ||
    endMinutes === null ||
    !Number.isInteger(slotDurationMinutes) ||
    slotDurationMinutes <= 0 ||
    startMinutes >= endMinutes
  ) {
    return [];
  }

  const slots = [];

  for (
    let currentMinutes = startMinutes;
    currentMinutes + slotDurationMinutes <= endMinutes;
    currentMinutes += slotDurationMinutes
  ) {
    slots.push({
      start_time: minutesToTime(currentMinutes),
      end_time: minutesToTime(currentMinutes + slotDurationMinutes),
      source,
    });
  }

  return slots;
}

function doTimeRangesOverlap(startA, endA, startB, endB) {
  const startAMinutes = timeToMinutes(startA);
  const endAMinutes = timeToMinutes(endA);
  const startBMinutes = timeToMinutes(startB);
  const endBMinutes = timeToMinutes(endB);

  if (
    startAMinutes === null ||
    endAMinutes === null ||
    startBMinutes === null ||
    endBMinutes === null
  ) {
    return false;
  }

  return startAMinutes < endBMinutes && startBMinutes < endAMinutes;
}

function toDatabaseWeekday(apiWeekday) {
  if (!Number.isInteger(apiWeekday) || apiWeekday < 1 || apiWeekday > 7) {
    return null;
  }

  return apiWeekday - 1;
}

function toApiWeekday(databaseWeekday) {
  if (!Number.isInteger(databaseWeekday) || databaseWeekday < 0 || databaseWeekday > 6) {
    return null;
  }

  return databaseWeekday + 1;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(`${startDate}T00:00:00Z`);
  const finalDate = new Date(`${endDate}T00:00:00Z`);

  while (currentDate <= finalDate) {
    dates.push(currentDate.toISOString().slice(0, 10));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}

function getDatabaseWeekdayFromDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const javascriptWeekday = date.getUTCDay();

  return (javascriptWeekday + 6) % 7;
}

function getMonthDateRange(month) {
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) {
    return null;
  }

  const [year, monthIndex] = month.split('-').map(Number);

  if (!year || !monthIndex || monthIndex < 1 || monthIndex > 12) {
    return null;
  }

  const firstDay = new Date(Date.UTC(year, monthIndex - 1, 1));
  const lastDay = new Date(Date.UTC(year, monthIndex, 0));

  return {
    startDate: firstDay.toISOString().slice(0, 10),
    endDate: lastDay.toISOString().slice(0, 10),
  };
}

module.exports = {
  DEFAULT_SLOT_DURATION_MINUTES,
  normalizeTime,
  timeToMinutes,
  minutesToTime,
  isTimeRangeValid,
  generateTimeSlots,
  doTimeRangesOverlap,
  toDatabaseWeekday,
  toApiWeekday,
  isValidDateString,
  getDatesBetween,
  getDatabaseWeekdayFromDate,
  getMonthDateRange,
};

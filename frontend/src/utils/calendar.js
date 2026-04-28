const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const calendarStatuses = ['available', 'pending', 'booked', 'blocked']

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getWeekStart(date) {
  const referenceDate = new Date(date)
  const weekDay = (referenceDate.getDay() + 6) % 7

  referenceDate.setDate(referenceDate.getDate() - weekDay)
  referenceDate.setHours(0, 0, 0, 0)

  return referenceDate
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMonthKey(date) {
  return formatDateKey(date).slice(0, 7)
}

function isSameDate(leftDate, rightDate) {
  return formatDateKey(leftDate) === formatDateKey(rightDate)
}

function isToday(date) {
  return isSameDate(date, new Date())
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatLongDate(value) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatShortDate(value) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function formatWeekRange(date) {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)

  weekEnd.setDate(weekStart.getDate() + 6)

  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`
}

function normalizeTimeLabel(time) {
  return String(time || '').slice(0, 5)
}

function buildMonthMatrix(referenceDate) {
  const monthStart = getMonthStart(referenceDate)
  const monthStartWeekday = (monthStart.getDay() + 6) % 7
  const gridStart = new Date(monthStart)

  gridStart.setDate(monthStart.getDate() - monthStartWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const currentDate = new Date(gridStart)
    currentDate.setDate(gridStart.getDate() + index)

    return {
      date: currentDate,
      dateKey: formatDateKey(currentDate),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === referenceDate.getMonth(),
      isToday: isToday(currentDate),
    }
  })
}

function buildWeekDays(referenceDate) {
  const weekStart = getWeekStart(referenceDate)

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(weekStart)
    currentDate.setDate(weekStart.getDate() + index)

    return {
      date: currentDate,
      dateKey: formatDateKey(currentDate),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === referenceDate.getMonth(),
      isToday: isToday(currentDate),
    }
  })
}

function groupSlotsByDate(slots) {
  return slots.reduce((map, slot) => {
    const currentSlots = map.get(slot.slot_date) || []
    currentSlots.push(slot)
    map.set(slot.slot_date, currentSlots)
    return map
  }, new Map())
}

function getStatusSummary(slots) {
  return slots.reduce(
    (summary, slot) => {
      summary[slot.status] = (summary[slot.status] || 0) + 1
      return summary
    },
    {
      available: 0,
      pending: 0,
      booked: 0,
      blocked: 0,
    }
  )
}

function filterSlotsByStatus(slots, status) {
  if (status === 'all') {
    return slots
  }

  return slots.filter((slot) => slot.status === status)
}

export {
  addMonths,
  buildWeekDays,
  buildMonthMatrix,
  calendarStatuses,
  filterSlotsByStatus,
  formatDateKey,
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  formatWeekRange,
  getMonthKey,
  getMonthStart,
  getStatusSummary,
  getWeekStart,
  groupSlotsByDate,
  isSameDate,
  normalizeTimeLabel,
  weekDayLabels,
}

import api from './api'

function normalizeApiDate(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function normalizeApiTime(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 8)
}

function normalizeCalendarSlot(slot) {
  return {
    ...slot,
    slot_date: normalizeApiDate(slot.slot_date),
    start_time: normalizeApiTime(slot.start_time),
    end_time: normalizeApiTime(slot.end_time),
  }
}

async function fetchCalendarMonth({ userId, month }) {
  const params = { month }

  if (userId) {
    params.user_id = userId
  }

  const response = await api.get('/calendar-slots', {
    params,
  })

  const data = response.data?.data || { user_id: userId, month, slots: [] }

  return {
    ...data,
    slots: (data.slots || []).map(normalizeCalendarSlot),
  }
}

async function fetchCalendarDay({ userId, date }) {
  const params = { date }

  if (userId) {
    params.user_id = userId
  }

  const response = await api.get('/calendar-slots/day', {
    params,
  })

  const data = response.data?.data || { user_id: userId, date, slots: [] }

  return {
    ...data,
    slots: (data.slots || []).map(normalizeCalendarSlot),
  }
}

async function fetchPublicCalendarMonth({ userId, month }) {
  const params = { month }

  if (userId) {
    params.user_id = userId
  }

  const response = await api.get('/public/calendar-slots', {
    params,
  })

  const data = response.data?.data || { month, slots: [] }

  return {
    ...data,
    slots: (data.slots || []).map(normalizeCalendarSlot),
  }
}

async function fetchPublicCalendarDay({ userId, date }) {
  const params = { date }

  if (userId) {
    params.user_id = userId
  }

  const response = await api.get('/public/calendar-slots/day', {
    params,
  })

  const data = response.data?.data || { date, slots: [] }

  return {
    ...data,
    slots: (data.slots || []).map(normalizeCalendarSlot),
  }
}

export {
  fetchCalendarDay,
  fetchCalendarMonth,
  fetchPublicCalendarDay,
  fetchPublicCalendarMonth,
}

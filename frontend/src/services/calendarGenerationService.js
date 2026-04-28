import api from './api'

async function generateCalendarSlots(payload) {
  const response = await api.post('/calendar-slots/generate', payload)

  return response.data?.data?.generation_summary || null
}

export { generateCalendarSlots }

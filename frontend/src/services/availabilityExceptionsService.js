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

function normalizeException(exception) {
  return {
    ...exception,
    exception_date: normalizeApiDate(exception.exception_date),
    start_time: normalizeApiTime(exception.start_time),
    end_time: normalizeApiTime(exception.end_time),
  }
}

async function fetchAvailabilityExceptions(filters = {}) {
  const response = await api.get('/availability-exceptions', {
    params: filters,
  })
  const exceptions = response.data?.data?.exceptions || []

  return exceptions.map(normalizeException)
}

async function createAvailabilityException(payload) {
  const response = await api.post('/availability-exceptions', payload)
  const exception = response.data?.data?.exception || null

  return exception ? normalizeException(exception) : null
}

async function updateAvailabilityException(exceptionId, payload) {
  const response = await api.put(`/availability-exceptions/${exceptionId}`, payload)
  const exception = response.data?.data?.exception || null

  return exception ? normalizeException(exception) : null
}

async function deleteAvailabilityException(exceptionId) {
  await api.delete(`/availability-exceptions/${exceptionId}`)
}

export {
  createAvailabilityException,
  deleteAvailabilityException,
  fetchAvailabilityExceptions,
  updateAvailabilityException,
}

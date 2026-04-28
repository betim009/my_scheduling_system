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

function normalizeBookingRequest(request) {
  return {
    ...request,
    requested_date: normalizeApiDate(request.requested_date),
    start_time: normalizeApiTime(request.start_time),
    end_time: normalizeApiTime(request.end_time),
  }
}

async function fetchMyBookingRequests() {
  const response = await api.get('/booking-requests/my')
  const bookingRequests = response.data?.data?.booking_requests || []

  return bookingRequests.map(normalizeBookingRequest)
}

async function fetchAdminBookingRequests(filters = {}) {
  const response = await api.get('/booking-requests', {
    params: filters,
  })
  const bookingRequests = response.data?.data?.booking_requests || []

  return bookingRequests.map(normalizeBookingRequest)
}

async function fetchBookingRequestById(requestId) {
  const response = await api.get(`/booking-requests/${requestId}`)
  const bookingRequest = response.data?.data?.booking_request || null

  return bookingRequest ? normalizeBookingRequest(bookingRequest) : null
}

async function cancelBookingRequest(requestId) {
  const response = await api.patch(`/booking-requests/${requestId}/cancel`)
  const bookingRequest = response.data?.data?.booking_request || null

  return bookingRequest ? normalizeBookingRequest(bookingRequest) : null
}

async function approveBookingRequest(requestId, payload = {}) {
  const response = await api.patch(`/booking-requests/${requestId}/approve`, payload)
  const bookingRequest = response.data?.data?.booking_request || null

  return bookingRequest ? normalizeBookingRequest(bookingRequest) : null
}

async function rejectBookingRequest(requestId, payload = {}) {
  const response = await api.patch(`/booking-requests/${requestId}/reject`, payload)
  const bookingRequest = response.data?.data?.booking_request || null

  return bookingRequest ? normalizeBookingRequest(bookingRequest) : null
}

export {
  approveBookingRequest,
  cancelBookingRequest,
  fetchAdminBookingRequests,
  fetchBookingRequestById,
  fetchMyBookingRequests,
  rejectBookingRequest,
}

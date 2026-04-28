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

function normalizeBooking(booking) {
  return {
    ...booking,
    booking_date: normalizeApiDate(booking.booking_date),
    start_time: normalizeApiTime(booking.start_time),
    end_time: normalizeApiTime(booking.end_time),
  }
}

function normalizeBookingFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

async function fetchMyBookings() {
  const response = await api.get('/bookings/my')
  const bookings = response.data?.data?.bookings || []

  return bookings.map(normalizeBooking)
}

async function fetchAdminBookings(filters = {}) {
  const response = await api.get('/bookings', {
    params: normalizeBookingFilters(filters),
  })
  const bookings = response.data?.data?.bookings || []

  return bookings.map(normalizeBooking)
}

async function cancelBooking(bookingId, payload = {}) {
  const response = await api.patch(`/bookings/${bookingId}/cancel`, payload)
  const booking = response.data?.data?.booking || null

  return booking ? normalizeBooking(booking) : null
}

async function rescheduleBooking(bookingId, payload) {
  const response = await api.patch(`/bookings/${bookingId}/reschedule`, payload)

  return {
    cancelled_booking: response.data?.data?.cancelled_booking
      ? normalizeBooking(response.data.data.cancelled_booking)
      : null,
    new_booking: response.data?.data?.new_booking
      ? normalizeBooking(response.data.data.new_booking)
      : null,
  }
}

export { fetchMyBookings, fetchAdminBookings, cancelBooking, rescheduleBooking }

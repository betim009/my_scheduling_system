import api from './api'

async function createBookingRequest(payload) {
  const response = await api.post('/booking-requests', payload)

  return {
    bookingRequest: response.data?.data?.booking_request || null,
    notificationMessage: response.data?.data?.booking_request?.notification_message || '',
  }
}

export { createBookingRequest }

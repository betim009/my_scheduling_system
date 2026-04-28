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

async function fetchAdminDashboardSummary() {
  const response = await api.get('/dashboard/admin-summary')
  const data = response.data?.data || {}

  return {
    metrics: {
      total_students: Number(data.metrics?.total_students || 0),
      total_pending_requests: Number(data.metrics?.total_pending_requests || 0),
      total_confirmed_bookings: Number(data.metrics?.total_confirmed_bookings || 0),
      total_active_subscriptions: Number(data.metrics?.total_active_subscriptions || 0),
      total_remaining_classes: Number(data.metrics?.total_remaining_classes || 0),
      total_plans: Number(data.metrics?.total_plans || 0),
    },
    recent_pending_requests: (data.recent_pending_requests || []).map((item) => ({
      ...item,
      requested_date: normalizeApiDate(item.requested_date),
      start_time: normalizeApiTime(item.start_time),
      end_time: normalizeApiTime(item.end_time),
    })),
    upcoming_bookings: (data.upcoming_bookings || []).map((item) => ({
      ...item,
      booking_date: normalizeApiDate(item.booking_date),
      start_time: normalizeApiTime(item.start_time),
      end_time: normalizeApiTime(item.end_time),
    })),
  }
}

export { fetchAdminDashboardSummary }

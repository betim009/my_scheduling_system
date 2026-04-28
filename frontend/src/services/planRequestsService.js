import api from './api'

function normalizeApiDate(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function normalizePlanRequest(planRequest) {
  return {
    ...planRequest,
    total_classes: Number(planRequest.total_classes || 0),
    classes_per_week: Number(planRequest.classes_per_week || 0),
    price: Number(planRequest.price || 0),
    price_per_class: Number(planRequest.price_per_class || 0),
    plan_is_active: Boolean(planRequest.plan_is_active),
    created_at: normalizeApiDate(planRequest.created_at),
    updated_at: normalizeApiDate(planRequest.updated_at),
  }
}

async function fetchPlanRequests(filters = {}) {
  const response = await api.get('/plan-requests', {
    params: filters,
  })
  const planRequests = response.data?.data?.plan_requests || []

  return planRequests.map(normalizePlanRequest)
}

async function createPlanRequest(payload) {
  const response = await api.post('/plan-requests', payload)
  const planRequest = response.data?.data?.plan_request || null

  return {
    planRequest: planRequest ? normalizePlanRequest(planRequest) : null,
    whatsappLink: response.data?.data?.whatsapp_link || '',
    whatsappContactName: response.data?.data?.whatsapp_contact_name || '',
    notificationMessage: response.data?.data?.notification_message || '',
  }
}

async function approvePlanRequest(requestId) {
  const response = await api.patch(`/plan-requests/${requestId}/approve`)

  return {
    planRequest: normalizePlanRequest(response.data?.data?.plan_request || {}),
    subscription: response.data?.data?.subscription || null,
  }
}

async function rejectPlanRequest(requestId) {
  const response = await api.patch(`/plan-requests/${requestId}/reject`)

  return normalizePlanRequest(response.data?.data?.plan_request || {})
}

export {
  approvePlanRequest,
  createPlanRequest,
  fetchPlanRequests,
  rejectPlanRequest,
}

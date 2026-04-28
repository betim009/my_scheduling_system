import api from './api'

function normalizePlan(plan) {
  return {
    ...plan,
    total_classes: Number(plan.total_classes || 0),
    classes_per_week: Number(plan.classes_per_week || 0),
    price: Number(plan.price || 0),
    price_per_class: Number(plan.price_per_class || 0),
    is_active: Boolean(plan.is_active),
  }
}

async function fetchAdminPlans() {
  const response = await api.get('/plans')
  const plans = response.data?.data?.plans || []

  return plans.map(normalizePlan)
}

async function createPlan(payload) {
  const response = await api.post('/plans', payload)
  return normalizePlan(response.data?.data?.plan || {})
}

async function updatePlan(planId, payload) {
  const response = await api.put(`/plans/${planId}`, payload)
  return normalizePlan(response.data?.data?.plan || {})
}

async function deletePlan(planId) {
  const response = await api.delete(`/plans/${planId}`)
  return normalizePlan(response.data?.data?.plan || {})
}

export { createPlan, deletePlan, fetchAdminPlans, updatePlan }

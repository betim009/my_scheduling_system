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

async function fetchPlans() {
  const response = await api.get('/plans')
  const plans = response.data?.data?.plans || []

  return plans.map(normalizePlan)
}

export { fetchPlans, normalizePlan }

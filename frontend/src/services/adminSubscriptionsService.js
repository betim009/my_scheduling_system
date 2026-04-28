import api from './api'

function normalizeApiDate(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function normalizeSubscription(subscription) {
  return {
    ...subscription,
    start_date: normalizeApiDate(subscription.start_date),
    end_date: normalizeApiDate(subscription.end_date),
    total_classes: Number(subscription.total_classes || 0),
    remaining_classes: Number(subscription.remaining_classes || 0),
    classes_per_week:
      subscription.classes_per_week !== undefined ? Number(subscription.classes_per_week) : null,
    price: subscription.price !== undefined ? Number(subscription.price) : null,
    price_per_class:
      subscription.price_per_class !== undefined ? Number(subscription.price_per_class) : null,
  }
}

async function fetchAdminSubscriptions(filters = {}) {
  const response = await api.get('/subscriptions', {
    params: filters,
  })
  const subscriptions = response.data?.data?.subscriptions || []

  return subscriptions.map(normalizeSubscription)
}

async function createSubscription(payload) {
  const response = await api.post('/subscriptions', payload)
  return normalizeSubscription(response.data?.data?.subscription || {})
}

async function updateSubscription(subscriptionId, payload) {
  const response = await api.put(`/subscriptions/${subscriptionId}`, payload)
  return normalizeSubscription(response.data?.data?.subscription || {})
}

async function updateSubscriptionStatus(subscriptionId, payload) {
  const response = await api.patch(`/subscriptions/${subscriptionId}/status`, payload)
  return normalizeSubscription(response.data?.data?.subscription || {})
}

async function adjustSubscriptionRemainingClasses(subscriptionId, payload) {
  const response = await api.patch(
    `/subscriptions/${subscriptionId}/remaining-classes`,
    payload
  )
  return normalizeSubscription(response.data?.data?.subscription || {})
}

export {
  adjustSubscriptionRemainingClasses,
  createSubscription,
  fetchAdminSubscriptions,
  updateSubscription,
  updateSubscriptionStatus,
}

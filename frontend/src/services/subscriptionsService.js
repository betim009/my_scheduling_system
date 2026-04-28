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

async function fetchMySubscriptions() {
  const response = await api.get('/subscriptions/my')
  const subscriptions = response.data?.data?.subscriptions || []

  return subscriptions.map(normalizeSubscription)
}

async function fetchMySubscriptionsSummary() {
  const response = await api.get('/subscriptions/my/summary')
  const data = response.data?.data || {}

  return {
    active_subscriptions_count: Number(data.active_subscriptions_count || 0),
    total_remaining_classes: Number(data.total_remaining_classes || 0),
    current_subscription: data.current_subscription
      ? normalizeSubscription(data.current_subscription)
      : null,
  }
}

export { fetchMySubscriptions, fetchMySubscriptionsSummary }

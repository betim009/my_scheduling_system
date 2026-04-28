import api from './api'

function normalizeApiTime(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 8)
}

function normalizeRule(rule) {
  return {
    ...rule,
    start_time: normalizeApiTime(rule.start_time),
    end_time: normalizeApiTime(rule.end_time),
  }
}

async function fetchAvailabilityRules(filters = {}) {
  const response = await api.get('/availability-rules', {
    params: filters,
  })
  const rules = response.data?.data?.rules || []

  return rules.map(normalizeRule)
}

async function createAvailabilityRule(payload) {
  const response = await api.post('/availability-rules', payload)
  const rule = response.data?.data?.rule || null

  return rule ? normalizeRule(rule) : null
}

async function updateAvailabilityRule(ruleId, payload) {
  const response = await api.put(`/availability-rules/${ruleId}`, payload)
  const rule = response.data?.data?.rule || null

  return rule ? normalizeRule(rule) : null
}

async function deleteAvailabilityRule(ruleId) {
  await api.delete(`/availability-rules/${ruleId}`)
}

export {
  createAvailabilityRule,
  deleteAvailabilityRule,
  fetchAvailabilityRules,
  updateAvailabilityRule,
}

import api from './api'

function mapSetting(setting) {
  return {
    ...setting,
    value: setting?.value,
  }
}

async function fetchSystemSettings() {
  const response = await api.get('/system-settings')
  const settings = response.data?.data?.settings || []

  return settings.map(mapSetting)
}

async function fetchSystemSettingByKey(key) {
  const response = await api.get(`/system-settings/${key}`)

  return mapSetting(response.data?.data?.setting || null)
}

async function updateSystemSetting(key, value) {
  const response = await api.put(`/system-settings/${key}`, { value })

  return mapSetting(response.data?.data?.setting || null)
}

async function updateSystemSettingsBatch(settings) {
  const response = await api.put('/system-settings', { settings })
  const updatedSettings = response.data?.data?.settings || []

  return updatedSettings.map(mapSetting)
}

export {
  fetchSystemSettings,
  fetchSystemSettingByKey,
  updateSystemSetting,
  updateSystemSettingsBatch,
}

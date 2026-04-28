import api from './api'

async function fetchPublicSystemSettings() {
  const response = await api.get('/system-settings/public')
  const settings = response.data?.data?.settings || []

  return settings.reduce((accumulator, setting) => {
    accumulator[setting.setting_key] = setting.value
    return accumulator
  }, {})
}

export { fetchPublicSystemSettings }

import api from './api'

async function updateMyProfile(payload) {
  const response = await api.patch('/users/me', payload)

  return response.data?.data?.user || null
}

export { updateMyProfile }

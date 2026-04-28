import api from './api'

async function fetchUsers(filters = {}) {
  const response = await api.get('/users', {
    params: filters,
  })

  return response.data?.data?.users || []
}

export { fetchUsers }

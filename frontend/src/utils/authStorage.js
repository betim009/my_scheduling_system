const TOKEN_STORAGE_KEY = 'sistema_agendamento_token'
const USER_STORAGE_KEY = 'sistema_agendamento_user'

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

function setStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

function getStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function setStoredUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  TOKEN_STORAGE_KEY,
}

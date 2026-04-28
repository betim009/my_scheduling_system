import { createContext, useEffect, useState } from 'react'
import api from '../services/api'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../utils/authStorage'

const AuthContext = createContext(null)

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  async function getCurrentUser() {
    const response = await api.get('/auth/me')
    const currentUser = response.data?.data?.user || null

    setUser(currentUser)
    setStoredUser(currentUser)

    return currentUser
  }

  function persistAuth(authToken, authUser) {
    setToken(authToken)
    setUser(authUser)
    setStoredToken(authToken)
    setStoredUser(authUser)
  }

  function logout() {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }

  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      const authToken = response.data?.data?.token
      const authUser = response.data?.data?.user

      persistAuth(authToken, authUser)

      return authUser
    } catch (error) {
      throw new Error(getApiMessage(error, 'Não foi possível realizar o login.'))
    }
  }

  async function register(payload) {
    try {
      const response = await api.post('/auth/register', payload)
      const authToken = response.data?.data?.token
      const authUser = response.data?.data?.user

      if (authToken && authUser) {
        persistAuth(authToken, authUser)
      }

      return authUser
    } catch (error) {
      throw new Error(getApiMessage(error, 'Não foi possível criar a conta.'))
    }
  }

  useEffect(() => {
    let ignore = false

    async function bootstrapAuth() {
      if (!token) {
        if (!ignore) {
          setLoading(false)
        }

        return
      }

      try {
        const currentUser = await getCurrentUser()

        if (ignore) {
          return
        }

        setUser(currentUser)
      } catch {
        if (!ignore) {
          logout()
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    bootstrapAuth()

    return () => {
      ignore = true
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        register,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }

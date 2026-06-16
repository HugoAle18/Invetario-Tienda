import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '@/api/auth'
import { setAccessToken } from '@/api/axios'
import { getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/token'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const refresh = getRefreshToken()
    if (!refresh) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authApi.refresh(refresh)
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      setUser(data.user)
    } catch {
      removeRefreshToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      const refresh = getRefreshToken()
      if (refresh) {
        await authApi.logout(refresh)
      }
    } catch {
      // ignore server error
    }
    setAccessToken(null)
    removeRefreshToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

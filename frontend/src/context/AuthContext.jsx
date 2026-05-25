import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getToken, setToken, setRefreshToken, clearTokens, parseToken, getRefreshToken } from '../api/axios'
import { reissue, logout as logoutApi } from '../api/members'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { email }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      reissue()
        .then(() => {
          const token = getToken()
          if (token) setUser(parseToken(token))
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback((accessToken, refreshToken) => {
    setToken(accessToken)
    setRefreshToken(refreshToken)
    setUser(parseToken(accessToken))
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

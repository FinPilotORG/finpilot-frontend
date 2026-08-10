import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loginUser, logoutUser, getCurrentUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('finpilot_token'))
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)

  const persistSession = useCallback(({ token, refreshToken }) => {
    localStorage.setItem('finpilot_token', token)
    if (refreshToken) localStorage.setItem('finpilot_refresh_token', refreshToken)
    setToken(token)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const data = await loginUser({ email, password })
      persistSession(data)
      return data
    },
    [persistSession]
  )

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('finpilot_refresh_token')
    try {
      if (rt) await logoutUser(rt)
    } catch {
      // Even if the backend call fails, clear the local session.
    }
    localStorage.removeItem('finpilot_token')
    localStorage.removeItem('finpilot_refresh_token')
    setToken(null)
    setUser(null)
  }, [])

  // Whenever we have a token but no user yet, fetch the profile.
  useEffect(() => {
    if (!token || user) return
    setLoadingUser(true)
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Token might be invalid/expired — clear it so the user is sent back to login.
        localStorage.removeItem('finpilot_token')
        localStorage.removeItem('finpilot_refresh_token')
        setToken(null)
      })
      .finally(() => setLoadingUser(false))
  }, [token, user])

  const value = { token, user, loadingUser, login, logout, isAuthenticated: !!token }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}

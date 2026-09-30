import { createContext, useEffect, useMemo, useState } from 'react'
import { authApi, clearTokens, getAccessToken, saveTokens } from './authApi.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    if (!getAccessToken()) return
    authApi.me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    async login(email, password) {
      const payload = await authApi.login(email, password)
      saveTokens(payload)
      setUser(payload.user)
      return payload.user
    },
    async register(body) {
      return authApi.register(body)
    },
    async verifyOtp(email, otp) {
      const payload = await authApi.verifyOtp(email, otp)
      saveTokens(payload)
      setUser(payload.user)
      return payload.user
    },
    resendOtp: authApi.resendOtp,
    async refreshUser() {
      const nextUser = await authApi.me()
      setUser(nextUser)
      return nextUser
    },
    logout() {
      authApi.logout()
      setUser(null)
      window.location.assign('/')
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

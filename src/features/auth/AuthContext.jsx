import { useEffect, useMemo, useState } from 'react'
import { authApi, clearTokens, getAccessToken, saveTokens } from './authApi.js'

import { AuthContext } from './authContext.js'

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
    async login(email, password, role) {
      const payload = await authApi.login(email, password, role)
      saveTokens(payload)
      setUser(payload.user)
      return payload.user
    },
    async register(body) {
      const payload = await authApi.register(body)
      if (payload?.access_token && payload?.user) {
        saveTokens(payload)
        setUser(payload.user)
      }
      return payload
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

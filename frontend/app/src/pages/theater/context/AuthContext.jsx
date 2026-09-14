import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getErrorMessage } from '../api/client'

const AuthContext = createContext(null)

// بما إن تسجيل الدخول بقى مشترك في الموقع كله، أي مستخدم (مش بس أصحاب السينمات)
// ممكن يكون عنده accessToken في localStorage. صفحة أصحاب السينمات لازم تتأكد
// من الـ role مش بس من وجود التوكن، وإلا هيبان الداشبورد لأي عميل عادي وتفشل
// كل طلبات الـ API عنده بـ 403.
const isOwner = (u) => u?.role === 'owner'

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem('accessToken')) && isOwner(getStoredUser())
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(email, password)
      const accessToken = data?.accessToken
      const refreshToken = data?.refreshToken
      const loggedInUser = data?.user || null

      if (!accessToken) {
        throw new Error('السيرفر رجّع رد لكن من غيره accessToken، اتأكد من شكل رد /auth/login')
      }

      if (!isOwner(loggedInUser)) {
        throw new Error('الحساب ده مش حساب صاحب سينما. سجّل دخول بحساب owner للوصول للوحة التحكم.')
      }

      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(loggedInUser))

      setUser(loggedInUser)
      setIsAuthenticated(true)
      return true
    } catch (err) {
      setError(getErrorMessage(err, 'الإيميل أو الباسورد غلط'))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const value = { user, isAuthenticated, loading, error, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth لازم يتستخدم جوه AuthProvider')
  return ctx
}

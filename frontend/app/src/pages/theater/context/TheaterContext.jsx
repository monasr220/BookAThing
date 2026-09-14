import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { getMyTheaters } from '../api/theaters'
import { getErrorMessage } from '../api/client'
import { useAuth } from './AuthContext'

const TheaterContext = createContext(null)

export function TheaterProvider({ children }) {
  const { isAuthenticated, isOwner } = useAuth()
  const [theaters, setTheaters] = useState([])
  const [selectedTheaterId, setSelectedTheaterId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshTheaters = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyTheaters()
      const list = Array.isArray(data) ? data : data?.theaters || []
      setTheaters(list)
      setSelectedTheaterId((prev) => {
        const stillExists = list.some((t) => (t._id || t.id) === prev)
        if (stillExists) return prev
        const first = list[0]
        return first ? first._id || first.id : null
      })
    } catch (err) {
      setError(getErrorMessage(err, 'حصل خطأ في تحميل بيانات السينمات'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // GET /theaters/mine is owner-only (403 for admin accounts) - admins manage
    // Movies/Offers/Refunds instead and never need the owner's theater list.
    if (isAuthenticated && isOwner) {
      refreshTheaters()
    } else {
      setTheaters([])
      setSelectedTheaterId(null)
      setLoading(false)
    }
  }, [isAuthenticated, isOwner, refreshTheaters])

  const value = {
    theaters,
    selectedTheaterId,
    setSelectedTheaterId,
    loading,
    error,
    refreshTheaters,
  }

  return (
    <TheaterContext.Provider value={value}>{children}</TheaterContext.Provider>
  )
}

export function useTheaters() {
  const ctx = useContext(TheaterContext)
  if (!ctx) throw new Error('useTheaters لازم يتستخدم جوه TheaterProvider')
  return ctx
}

import apiClient, { unwrap } from './client'

export async function getShowtimesByTheater(theaterId, date) {
  const response = await apiClient.get(`/showtimes/theater/${theaterId}`, {
    params: date ? { date } : {},
  })
  return unwrap(response)
}

// ملاحظة: أسماء الحقول (movieId, screenId, date, startTime, price) افتراضية
// راجع API_DOCUMENTATION.md في الباك إند للتأكد وعدّل هنا لو مختلفة
export async function createShowtime(payload) {
  const response = await apiClient.post('/showtimes', payload)
  return unwrap(response)
}

export async function updateShowtime(showtimeId, payload) {
  const response = await apiClient.put(`/showtimes/${showtimeId}`, payload)
  return unwrap(response)
}

export async function cancelShowtime(showtimeId) {
  const response = await apiClient.patch(`/showtimes/${showtimeId}/cancel`)
  return unwrap(response)
}

export async function deleteShowtime(showtimeId) {
  const response = await apiClient.delete(`/showtimes/${showtimeId}`)
  return unwrap(response)
}

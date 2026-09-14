import apiClient, { unwrap } from './client'

export async function getMyTheaters() {
  const response = await apiClient.get('/theaters/mine')
  return unwrap(response)
}

// ملاحظة: أسماء الحقول هنا (name, city, address, phone) افتراضية بناءً على المتوقع.
// راجع ملف API_DOCUMENTATION.md في الباك إند للتأكد من الأسماء بالظبط وعدّلها هنا لو مختلفة.
export async function createTheater(payload) {
  const response = await apiClient.post('/theaters', payload)
  return unwrap(response)
}

export async function updateTheater(theaterId, payload) {
  const response = await apiClient.put(`/theaters/${theaterId}`, payload)
  return unwrap(response)
}

export async function deleteTheater(theaterId) {
  const response = await apiClient.delete(`/theaters/${theaterId}`)
  return unwrap(response)
}

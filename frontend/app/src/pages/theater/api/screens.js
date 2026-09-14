import apiClient, { unwrap } from './client'

export async function getScreens(theaterId) {
  const response = await apiClient.get(`/theaters/${theaterId}/screens`)
  return unwrap(response)
}

// ملاحظة: أسماء الحقول (name, type, capacity) افتراضية، راجع API_DOCUMENTATION.md لو مختلفة
export async function createScreen(theaterId, payload) {
  const response = await apiClient.post(`/theaters/${theaterId}/screens`, payload)
  return unwrap(response)
}

export async function updateScreen(theaterId, screenId, payload) {
  const response = await apiClient.put(`/theaters/${theaterId}/screens/${screenId}`, payload)
  return unwrap(response)
}

export async function deleteScreen(theaterId, screenId) {
  const response = await apiClient.delete(`/theaters/${theaterId}/screens/${screenId}`)
  return unwrap(response)
}

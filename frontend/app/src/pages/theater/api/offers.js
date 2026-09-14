import apiClient, { unwrap } from './client'

// كل الـ endpoints دي admin-only (شوف offerRoutes.js) - GET / بترجع كل
// العروض (فعالة وغير فعالة)، بعكس GET /offers/active العامة المستخدمة في
// صفحة ActiveOffers.jsx للعملاء.

export async function getAllOffers() {
  const response = await apiClient.get('/offers')
  return unwrap(response)
}

export async function getOfferById(offerId) {
  const response = await apiClient.get(`/offers/${offerId}`)
  return unwrap(response)
}

export async function createOffer(payload) {
  const response = await apiClient.post('/offers', payload)
  return unwrap(response)
}

export async function updateOffer(offerId, payload) {
  const response = await apiClient.put(`/offers/${offerId}`, payload)
  return unwrap(response)
}

export async function deactivateOffer(offerId) {
  const response = await apiClient.patch(`/offers/${offerId}/deactivate`)
  return unwrap(response)
}

export async function deleteOffer(offerId) {
  const response = await apiClient.delete(`/offers/${offerId}`)
  return unwrap(response)
}

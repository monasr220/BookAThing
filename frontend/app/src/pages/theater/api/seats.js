import apiClient, { unwrap } from './client'

// GET /api/seats/screen/:screenId — raw seat configuration (no availability data)
export async function getScreenSeats(screenId) {
  const response = await apiClient.get(`/seats/screen/${screenId}`)
  return unwrap(response)
}

// PUT /api/seats/screen/:screenId — replaces the entire seat layout for a screen
// Expects an array of { row, number_in_row, seat_type, priceMultiplier }
export async function updateScreenSeats(screenId, seats) {
  const response = await apiClient.put(`/seats/screen/${screenId}`, { seats })
  return unwrap(response)
}

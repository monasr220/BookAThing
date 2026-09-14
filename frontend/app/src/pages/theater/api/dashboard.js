import apiClient, { unwrap } from './client'

export async function getOverview(theaterId, fromDate, toDate) {
  const response = await apiClient.get(`/theaters/${theaterId}/dashboard/overview`, {
    params: { fromDate, toDate },
  })
  return unwrap(response)
}

export async function getRevenueByMovie(theaterId, fromDate, toDate) {
  const response = await apiClient.get(
    `/theaters/${theaterId}/dashboard/revenue-by-movie`,
    { params: { fromDate, toDate } }
  )
  return unwrap(response)
}

export async function getUpcomingShowtimes(theaterId) {
  const response = await apiClient.get(
    `/theaters/${theaterId}/dashboard/upcoming-showtimes`
  )
  return unwrap(response)
}

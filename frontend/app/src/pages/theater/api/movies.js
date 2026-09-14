import apiClient, { unwrap } from './client'

// ملاحظة: /movies و /movies/search و /movies/popular و /movies/upcoming و
// /movies/now-in-cinemas و /movies/coming-soon كلها بترجع الأراي مباشرة
// (res.status(200).json(movies)) مش لفّافة { data }، لكن create/update بترجع
// { message, movie } - عشان كده مش بنستخدم unwrap() هنا، بنرجع response.data
// أو response.data.movie على حسب كل endpoint (راجع movieController.js).

export async function getMovies() {
  const response = await apiClient.get('/movies')
  return response.data
}

export async function searchMovies(query) {
  const response = await apiClient.get('/movies/search', { params: { query } })
  return response.data
}

export async function getMovieById(movieId) {
  const response = await apiClient.get(`/movies/${movieId}`)
  return response.data // { movie, showtimes }
}

export async function getBookingStats(movieId, timeframe) {
  const response = await apiClient.get(`/movies/${movieId}/booking-stats`, {
    params: timeframe ? { timeframe } : {},
  })
  return response.data // { ticketCount }
}

export async function createMovie(payload) {
  const response = await apiClient.post('/movies', payload)
  return response.data.movie
}

export async function updateMovie(movieId, payload) {
  const response = await apiClient.put(`/movies/${movieId}`, payload)
  return response.data.movie
}

export async function deleteMovie(movieId) {
  const response = await apiClient.delete(`/movies/${movieId}`)
  return response.data
}

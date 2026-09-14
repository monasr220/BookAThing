import apiClient, { unwrap } from './client'

// endpoint عام (Public)، بنستخدمه بس عشان نملى قايمة الأفلام في فورم إضافة موعد عرض
export async function getMovies() {
  const response = await apiClient.get('/movies')
  return unwrap(response)
}

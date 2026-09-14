import apiClient, { unwrap } from './client'

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password })
  return unwrap(response)
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    // مش مشكلة لو الـ logout فشل في السيرفر، هنمسح الجلسة محلياً برضه
  }
}

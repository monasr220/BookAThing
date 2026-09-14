import api, { unwrap } from "../../lib/api";

// GET /theaters, GET /theaters/:id, GET /theaters/:id/screens و
// GET /showtimes/theater/:id كلها public endpoints (مفيش authenticateJWT عليهم)
// وبترجع مغلفة بـ { success, message, data } زي باقي الـ SuccessResponse.

export async function getAllTheaters(city) {
  const response = await api.get("/theaters", { params: city ? { city } : {} });
  return unwrap(response);
}

export async function getTheaterById(theaterId) {
  const response = await api.get(`/theaters/${theaterId}`);
  return unwrap(response);
}

export async function getScreensByTheater(theaterId) {
  const response = await api.get(`/theaters/${theaterId}/screens`);
  return unwrap(response);
}

export async function getShowtimesByTheater(theaterId) {
  const response = await api.get(`/showtimes/theater/${theaterId}`);
  return unwrap(response);
}

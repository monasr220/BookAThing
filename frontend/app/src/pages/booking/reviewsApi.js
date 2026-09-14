import api, { getErrorMessage } from '../../lib/api';

export { getErrorMessage };

// GET /api/reviews/movie/:movieId?page=&limit=
// Response shape: { success, message, meta: { totalItems, totalPages, currentPage, limit, stats }, data: [...] }
export async function getMovieReviews(movieId, { page = 1, limit = 10 } = {}) {
    const response = await api.get(`/reviews/movie/${movieId}`, { params: { page, limit } });
    const body = response.data;
    return {
        reviews: body?.data || [],
        stats: body?.meta?.stats || null,
        totalItems: body?.meta?.totalItems || 0,
        totalPages: body?.meta?.totalPages || 1,
        currentPage: body?.meta?.currentPage || 1,
    };
}

// POST /api/reviews  (Bearer)
export async function createReview({ movieId, rating, comment }) {
    const response = await api.post('/reviews', { movieId, rating, comment });
    return response.data?.data;
}

// PUT /api/reviews/:id  (Bearer, own review only)
export async function updateReview(id, { rating, comment }) {
    const response = await api.put(`/reviews/${id}`, { rating, comment });
    return response.data?.data;
}

// DELETE /api/reviews/:id  (Bearer, own review only)
export async function deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data?.data;
}

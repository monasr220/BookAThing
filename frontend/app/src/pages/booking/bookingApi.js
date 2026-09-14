import api, { unwrap, getErrorMessage } from '../../lib/api';

export { getErrorMessage };

// GET /api/movies/:id — returns { movie, showtimes } directly (not wrapped
// in { data }), with showtimes already populated with theater + screen info
// and filtered to today-or-later.
export async function getMovieWithShowtimes(movieId) {
    const response = await api.get(`/movies/${movieId}`);
    return response.data; // { movie, showtimes }
}

// GET /api/seats/screen/:screenId/layout/:showtimeId
export async function getSeatLayout(screenId, showtimeId) {
    const response = await api.get(`/seats/screen/${screenId}/layout/${showtimeId}`);
    return unwrap(response); // array of { id, seatNumber, seatType, priceMultiplier, isAvailable }
}

// POST /api/bookings
export async function createBooking({ movieId, theaterId, showtimeId, seats, promoCode, basePrice }) {
    const response = await api.post('/bookings', {
        movieId,
        theaterId,
        showtimeId,
        seats,
        promoCode: promoCode || undefined,
        basePrice,
    });
    return response.data; // { message, booking, subTotal, discount, appliedOffer }
}

// GET /api/bookings/my-bookings
export async function getUserBookings() {
    const response = await api.get('/bookings/my-bookings');
    return unwrap(response); // array of bookings with populated movie, theater, showtime, offer
}

// DELETE /api/bookings/:bookingId
export async function cancelBooking(bookingId) {
    const response = await api.delete(`/bookings/${bookingId}`);
    return unwrap(response); // cancelled booking data
}

// POST /api/payments
export async function processPayment({ bookingId, amount, paymentMethod, currency = 'EGP' }) {
    const response = await api.post('/payments', { bookingId, amount, paymentMethod, currency });
    return unwrap(response); // { id, bookingId, amount, currency, status, paymentMethod, transactionRef, createdAt }
}

// GET /api/payments/booking/:bookingId
export async function getPaymentByBooking(bookingId) {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return unwrap(response); // payment details
}

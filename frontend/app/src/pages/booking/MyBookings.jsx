import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, clearSession } from '../../lib/api';
import { getUserBookings, cancelBooking, getErrorMessage } from './bookingApi';
import './MyBookings.css';

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/auth?redirect=/my-bookings');
            return;
        }

        loadBookings();
    }, [navigate]);

    const loadBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getUserBookings();
            setBookings(data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load your bookings.'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        setCancellingId(bookingId);
        try {
            await cancelBooking(bookingId);
            // Refresh bookings after cancellation
            await loadBookings();
        } catch (err) {
            alert(getErrorMessage(err, 'Failed to cancel booking.'));
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending' },
            confirmed: { class: 'status-confirmed', label: 'Confirmed' },
            cancelled: { class: 'status-cancelled', label: 'Cancelled' },
        };
        const config = statusConfig[status] || { class: 'status-unknown', label: status };
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    const getPaymentStatusBadge = (paymentStatus) => {
        const statusConfig = {
            paid: { class: 'payment-paid', label: 'Paid' },
            unpaid: { class: 'payment-unpaid', label: 'Unpaid' },
            refunded: { class: 'payment-refunded', label: 'Refunded' },
            failed: { class: 'payment-failed', label: 'Failed' },
        };
        const config = statusConfig[paymentStatus] || { class: 'payment-unknown', label: paymentStatus };
        return <span className={`payment-badge ${config.class}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <div className="my-bookings-page">
                <div className="container">
                    <div className="loading-state">Loading your bookings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="container">
                <div className="my-bookings-header">
                    <h1>My Bookings</h1>
                    <button
                        className="btn btn-outline-light"
                        onClick={loadBookings}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={loadBookings} className="retry-btn">Try Again</button>
                    </div>
                )}

                {!error && bookings.length === 0 && (
                    <div className="empty-state">
                        <i className="fa-solid fa-ticket empty-icon"></i>
                        <h3>No bookings yet</h3>
                        <p>You haven't made any movie bookings yet.</p>
                        <button 
                            className="btn btn-warning" 
                            onClick={() => navigate('/')}
                        >
                            Browse Movies
                        </button>
                    </div>
                )}

                {!error && bookings.length > 0 && (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-card-header">
                                    <div className="movie-info">
                                        {booking.movieId?.poster_url && (
                                            <img 
                                                src={booking.movieId.poster_url} 
                                                alt={booking.movieId.title}
                                                className="movie-poster"
                                            />
                                        )}
                                        <div className="movie-details">
                                            <h3>{booking.movieId?.title || 'Unknown Movie'}</h3>
                                            <p className="theater-name">
                                                {booking.theaterId?.name || 'Unknown Theater'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="booking-status">
                                        {getStatusBadge(booking.status)}
                                        {getPaymentStatusBadge(booking.paymentStatus)}
                                    </div>
                                </div>

                                <div className="booking-card-body">
                                    <div className="booking-detail">
                                        <span className="detail-label">Showtime:</span>
                                        <span className="detail-value">
                                            {booking.showtimeId?.start_time 
                                                ? new Date(booking.showtimeId.start_time).toLocaleString()
                                                : 'Not specified'}
                                        </span>
                                    </div>

                                    <div className="booking-detail">
                                        <span className="detail-label">Screen:</span>
                                        <span className="detail-value">
                                            {booking.showtimeId?.screen_id?.screenName || 'N/A'} 
                                            {booking.showtimeId?.screen_id?.screenType && ` (${booking.showtimeId.screen_id.screenType})`}
                                        </span>
                                    </div>

                                    <div className="booking-detail">
                                        <span className="detail-label">Seats:</span>
                                        <span className="detail-value">
                                            {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
                                        </span>
                                    </div>

                                    <div className="booking-detail">
                                        <span className="detail-label">Total:</span>
                                        <span className="detail-value price">
                                            {booking.totalPrice} EGP
                                        </span>
                                    </div>

                                    {booking.offerId && (
                                        <div className="booking-detail offer-applied">
                                            <span className="detail-label">Offer Applied:</span>
                                            <span className="detail-value">
                                                {booking.offerId.title} ({booking.offerId.discountType})
                                            </span>
                                        </div>
                                    )}

                                    {booking.discountAmount > 0 && (
                                        <div className="booking-detail discount">
                                            <span className="detail-label">Discount:</span>
                                            <span className="detail-value discount-amount">
                                                -{booking.discountAmount} EGP
                                            </span>
                                        </div>
                                    )}

                                    <div className="booking-detail">
                                        <span className="detail-label">Booking Date:</span>
                                        <span className="detail-value">
                                            {new Date(booking.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="booking-card-footer">
                                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                        <button
                                            className="btn btn-danger cancel-btn"
                                            onClick={() => handleCancelBooking(booking._id)}
                                            disabled={cancellingId === booking._id}
                                        >
                                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary" disabled>
                                            {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
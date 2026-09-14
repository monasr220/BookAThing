import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './MovieBooking.css';
import { isLoggedIn } from '../../lib/api';
import {
    getMovieWithShowtimes,
    getSeatLayout,
    createBooking,
    processPayment,
    getErrorMessage,
} from './bookingApi';
import MovieReviews from './MovieReviews';

const STEPS = ['theater', 'showtime', 'seats', 'review', 'payment', 'confirmation'];
const STEP_LABELS = {
    theater: 'Cinema',
    showtime: 'Showtime',
    seats: 'Seats',
    review: 'Review',
    payment: 'Payment',
    confirmation: 'Done',
};
const BASE_PRICE = 100; // must match the backend's default basePrice (see bookingServices.js)
const PAYMENT_METHODS = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'fawry', label: 'Fawry' },
    { value: 'vodafone_cash', label: 'Vodafone Cash' },
];

export default function MovieBooking() {
    const { id: movieId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);

    const [step, setStep] = useState('theater');
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);

    const [seats, setSeats] = useState([]);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [seatsError, setSeatsError] = useState('');
    const [selectedSeats, setSelectedSeats] = useState([]);

    const [promoCode, setPromoCode] = useState('');
    const [bookingResult, setBookingResult] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [paymentResult, setPaymentResult] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // --- Load movie + showtimes ---
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        getMovieWithShowtimes(movieId)
            .then((data) => {
                if (cancelled) return;
                setMovie(data.movie);
                setShowtimes(data.showtimes || []);
            })
            .catch((err) => {
                if (!cancelled) setError(getErrorMessage(err, 'Could not load this movie.'));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [movieId]);

    // --- Group showtimes by theater for the "select cinema" step ---
    const theaters = useMemo(() => {
        const map = new Map();
        for (const st of showtimes) {
            const theater = st.theater_id;
            if (!theater?._id) continue;
            if (!map.has(theater._id)) {
                map.set(theater._id, { theater, showtimes: [] });
            }
            map.get(theater._id).showtimes.push(st);
        }
        return Array.from(map.values());
    }, [showtimes]);

    const showtimesForSelectedTheater = useMemo(() => {
        if (!selectedTheater) return [];
        return theaters.find((t) => t.theater._id === selectedTheater._id)?.showtimes || [];
    }, [theaters, selectedTheater]);

    const goToStep = (nextStep) => {
        setStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectTheater = (theater) => {
        setSelectedTheater(theater);
        goToStep('showtime');
    };

    const handleSelectShowtime = async (showtime) => {
        setSelectedShowtime(showtime);
        setSelectedSeats([]);
        setSeatsError('');
        setSeatsLoading(true);
        goToStep('seats');

        try {
            const layout = await getSeatLayout(showtime.screen_id._id, showtime._id);
            setSeats(layout);
        } catch (err) {
            setSeatsError(getErrorMessage(err, 'Could not load the seat map.'));
        } finally {
            setSeatsLoading(false);
        }
    };

    const toggleSeat = (seat) => {
        if (!seat.isAvailable) return;
        setSelectedSeats((prev) =>
            prev.some((s) => s.seatNumber === seat.seatNumber)
                ? prev.filter((s) => s.seatNumber !== seat.seatNumber)
                : [...prev, seat]
        );
    };

    const estimatedSubtotal = useMemo(
        () => selectedSeats.reduce((sum, s) => sum + BASE_PRICE * (s.priceMultiplier || 1), 0),
        [selectedSeats]
    );

    const handleConfirmBooking = async () => {
        if (!isLoggedIn()) {
            navigate(`/auth?redirect=/movie/${movieId}`);
            return;
        }

        setBookingLoading(true);
        setBookingError('');
        try {
            const result = await createBooking({
                movieId,
                theaterId: selectedTheater._id,
                showtimeId: selectedShowtime._id,
                seats: selectedSeats.map((s) => s.seatNumber),
                promoCode: promoCode.trim(),
                basePrice: BASE_PRICE,
            });
            setBookingResult(result);
            goToStep('payment');
        } catch (err) {
            setBookingError(getErrorMessage(err, 'Could not create the booking.'));
        } finally {
            setBookingLoading(false);
        }
    };

    const handlePay = async () => {
        setPaymentLoading(true);
        setPaymentError('');
        try {
            const result = await processPayment({
                bookingId: bookingResult.booking._id,
                amount: bookingResult.booking.totalPrice,
                paymentMethod,
            });
            setPaymentResult(result);
            goToStep('confirmation');
        } catch (err) {
            setPaymentError(getErrorMessage(err, 'Payment failed.'));
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return <div className="booking-page booking-status">Loading movie...</div>;
    }

    if (error || !movie) {
        return (
            <div className="booking-page booking-status">
                <p className="booking-error">{error || 'Movie not found.'}</p>
                <Link to="/" className="btn btn-outline-warning">Back to home</Link>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-hero">
                <div
                    className="booking-poster"
                    style={{ backgroundImage: `url(${movie.poster_url || movie.poster || ''})` }}
                />
                <div className="booking-hero-info">
                    <Link to="/" className="booking-back-link">&larr; Back to movies</Link>
                    <h2>{movie.title}</h2>
                    <p className="booking-meta">
                        {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                        {movie.duration ? ` · ${movie.duration} min` : ''}
                    </p>
                    {movie.description && <p className="booking-description">{movie.description}</p>}
                </div>
            </div>

            <div className="booking-steps">
                {STEPS.map((s) => (
                    <div key={s} className={`booking-step-pill ${step === s ? 'active' : ''}`}>
                        {STEP_LABELS[s]}
                    </div>
                ))}
            </div>

            <div className="booking-card">
                {step === 'theater' && (
                    <>
                        <h5>Choose a cinema</h5>
                        {theaters.length === 0 && (
                            <p className="booking-empty">No upcoming showtimes for this movie yet.</p>
                        )}
                        <div className="booking-list">
                            {theaters.map(({ theater, showtimes: sts }) => (
                                <button
                                    key={theater._id}
                                    className="booking-option"
                                    onClick={() => handleSelectTheater(theater)}
                                >
                                    <span className="booking-option-title">{theater.name}</span>
                                    <span className="booking-option-sub">
                                        {theater.location?.city || ''} · {sts.length} showtime{sts.length !== 1 ? 's' : ''}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {step === 'showtime' && selectedTheater && (
                    <>
                        <h5>Choose a showtime — {selectedTheater.name}</h5>
                        <div className="booking-list">
                            {showtimesForSelectedTheater.map((st) => (
                                <button
                                    key={st._id}
                                    className="booking-option"
                                    onClick={() => handleSelectShowtime(st)}
                                >
                                    <span className="booking-option-title">
                                        {new Date(st.start_time).toLocaleString(undefined, {
                                            weekday: 'short', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                    <span className="booking-option-sub">
                                        {st.screen_id?.screenName} · {st.screen_id?.screenType} · {st.language}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button className="booking-back-btn" onClick={() => goToStep('theater')}>
                            &larr; Change cinema
                        </button>
                    </>
                )}

                {step === 'seats' && (
                    <>
                        <h5>Choose your seats</h5>
                        {seatsLoading && <p>Loading seat map...</p>}
                        {seatsError && <p className="booking-error">{seatsError}</p>}
                        {!seatsLoading && !seatsError && (
                            <>
                                <div className="booking-screen-label">SCREEN</div>
                                <div className="booking-seat-grid">
                                    {seats.map((seat) => {
                                        const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                                        return (
                                            <button
                                                key={seat.seatNumber}
                                                disabled={!seat.isAvailable}
                                                onClick={() => toggleSeat(seat)}
                                                title={`${seat.seatNumber} · ${seat.seatType}`}
                                                className={
                                                    'booking-seat' +
                                                    (!seat.isAvailable ? ' taken' : '') +
                                                    (isSelected ? ' selected' : '')
                                                }
                                            >
                                                {seat.seatNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="booking-seat-legend">
                                    <span><i className="booking-seat-swatch" /> Available</span>
                                    <span><i className="booking-seat-swatch selected" /> Selected</span>
                                    <span><i className="booking-seat-swatch taken" /> Taken</span>
                                </div>

                                <div className="booking-summary-bar">
                                    <span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</span>
                                    <span>Est. {estimatedSubtotal} EGP</span>
                                </div>

                                <button
                                    className="btn btn-warning w-100"
                                    disabled={selectedSeats.length === 0}
                                    onClick={() => goToStep('review')}
                                >
                                    Continue
                                </button>
                            </>
                        )}
                        <button className="booking-back-btn" onClick={() => goToStep('showtime')}>
                            &larr; Change showtime
                        </button>
                    </>
                )}

                {step === 'review' && (
                    <>
                        <h5>Review your booking</h5>
                        <div className="booking-review-row"><span>Movie</span><span>{movie.title}</span></div>
                        <div className="booking-review-row"><span>Cinema</span><span>{selectedTheater.name}</span></div>
                        <div className="booking-review-row">
                            <span>Showtime</span>
                            <span>{new Date(selectedShowtime.start_time).toLocaleString()}</span>
                        </div>
                        <div className="booking-review-row">
                            <span>Seats</span>
                            <span>{selectedSeats.map((s) => s.seatNumber).join(', ')}</span>
                        </div>
                        <div className="booking-review-row">
                            <span>Estimated total</span>
                            <span>{estimatedSubtotal} EGP</span>
                        </div>

                        <label className="booking-promo-label">Promo code (optional)</label>
                        <input
                            className="booking-promo-input"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="e.g. WELCOME10"
                        />

                        {!isLoggedIn() && (
                            <p className="booking-hint">You'll need to log in to confirm this booking.</p>
                        )}
                        {bookingError && <p className="booking-error">{bookingError}</p>}

                        <button
                            className="btn btn-warning w-100"
                            disabled={bookingLoading}
                            onClick={handleConfirmBooking}
                        >
                            {bookingLoading ? 'Booking...' : isLoggedIn() ? 'Confirm Booking' : 'Log in to continue'}
                        </button>
                        <button className="booking-back-btn" onClick={() => goToStep('seats')}>
                            &larr; Change seats
                        </button>
                    </>
                )}

                {step === 'payment' && bookingResult && (
                    <>
                        <h5>Payment</h5>
                        <div className="booking-review-row">
                            <span>Total due</span>
                            <span>{bookingResult.booking.totalPrice} EGP</span>
                        </div>
                        {bookingResult.discount > 0 && (
                            <div className="booking-review-row booking-discount">
                                <span>Discount applied</span>
                                <span>-{bookingResult.discount} EGP</span>
                            </div>
                        )}

                        <label className="booking-promo-label">Payment method</label>
                        <div className="booking-payment-methods">
                            {PAYMENT_METHODS.map((m) => (
                                <button
                                    key={m.value}
                                    className={'booking-option' + (paymentMethod === m.value ? ' selected' : '')}
                                    onClick={() => setPaymentMethod(m.value)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {paymentError && <p className="booking-error">{paymentError}</p>}

                        <button className="btn btn-warning w-100" disabled={paymentLoading} onClick={handlePay}>
                            {paymentLoading ? 'Processing...' : `Pay ${bookingResult.booking.totalPrice} EGP`}
                        </button>
                    </>
                )}

                {step === 'confirmation' && paymentResult && (
                    <div className="booking-confirmation">
                        <i className="fa-solid fa-circle-check booking-confirmation-icon" />
                        <h5>Booking confirmed!</h5>
                        <p>Your tickets for <strong>{movie.title}</strong> are booked.</p>
                        <div className="booking-review-row"><span>Transaction ref</span><span>{paymentResult.transactionRef}</span></div>
                        <div className="booking-review-row"><span>Amount paid</span><span>{paymentResult.amount} {paymentResult.currency}</span></div>
                        <Link to={`/receipt/${paymentResult.bookingId}`} className="btn btn-warning w-100 mt-3">View receipt</Link>
                        <Link to="/" className="btn btn-outline-warning w-100 mt-2">Back to home</Link>
                    </div>
                )}
            </div>

            <MovieReviews movieId={movieId} />
        </div>
    );
}

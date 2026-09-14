import { useCallback, useEffect, useState } from 'react';
import { isLoggedIn, getCurrentUser } from '../../lib/api';
import {
    getMovieReviews,
    createReview,
    updateReview,
    deleteReview,
    getErrorMessage,
} from './reviewsApi';

function Stars({ value, onChange, readOnly = false }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className={`review-stars${readOnly ? ' readonly' : ''}`}>
            {stars.map((n) => (
                <i
                    key={n}
                    className={`fa-solid fa-star${n <= value ? '' : ' fa-star-empty'}`}
                    onClick={readOnly ? undefined : () => onChange(n)}
                    role={readOnly ? undefined : 'button'}
                />
            ))}
        </div>
    );
}

export default function MovieReviews({ movieId }) {
    const currentUser = getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.id;

    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const load = useCallback((pageToLoad = 1, replace = true) => {
        setLoading(true);
        setError('');
        getMovieReviews(movieId, { page: pageToLoad, limit: 10 })
            .then(({ reviews: data, stats: s, totalPages: tp, currentPage }) => {
                setReviews((prev) => (replace ? data : [...prev, ...data]));
                setStats(s);
                setTotalPages(tp);
                setPage(currentPage);
            })
            .catch((err) => setError(getErrorMessage(err, 'Could not load reviews.')))
            .finally(() => setLoading(false));
    }, [movieId]);

    useEffect(() => {
        load(1, true);
    }, [load]);

    const myExistingReview = reviews.find((r) => (r.user?.id || r.user) === currentUserId);

    const startEdit = (review) => {
        setEditingId(review.id);
        setMyRating(review.rating);
        setMyComment(review.comment);
        setFormError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setMyRating(0);
        setMyComment('');
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (myRating < 1) {
            setFormError('Please pick a star rating.');
            return;
        }
        setSubmitting(true);
        setFormError('');
        try {
            if (editingId) {
                await updateReview(editingId, { rating: myRating, comment: myComment.trim() });
            } else {
                await createReview({ movieId, rating: myRating, comment: myComment.trim() });
            }
            cancelEdit();
            load(1, true);
        } catch (err) {
            setFormError(getErrorMessage(err, 'Could not save your review.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (review) => {
        if (!window.confirm('Delete your review?')) return;
        try {
            await deleteReview(review.id);
            cancelEdit();
            load(1, true);
        } catch (err) {
            window.alert(getErrorMessage(err, 'Could not delete your review.'));
        }
    };

    return (
        <div className="movie-reviews">
            <div className="movie-reviews-header">
                <h5>Ratings &amp; Reviews</h5>
                {stats && (
                    <div className="movie-reviews-summary">
                        <Stars value={Math.round(stats.averageRating)} readOnly onChange={() => {}} />
                        <span>{stats.averageRating} · {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {isLoggedIn() ? (
                !myExistingReview || editingId ? (
                    <form className="movie-review-form" onSubmit={handleSubmit}>
                        <Stars value={myRating} onChange={setMyRating} />
                        <textarea
                            placeholder="Share your thoughts about this movie..."
                            value={myComment}
                            onChange={(e) => setMyComment(e.target.value)}
                            rows={3}
                            required
                        />
                        {formError && <p className="booking-error">{formError}</p>}
                        <div className="movie-review-form-actions">
                            <button className="btn btn-warning" type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : editingId ? 'Update review' : 'Post review'}
                            </button>
                            {editingId && (
                                <button type="button" className="booking-back-btn" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                ) : (
                    <p className="booking-hint">
                        You already reviewed this movie.{' '}
                        <button type="button" className="link-button" onClick={() => startEdit(myExistingReview)}>
                            Edit your review
                        </button>
                    </p>
                )
            ) : (
                <p className="booking-hint">Log in to leave a review.</p>
            )}

            {loading && reviews.length === 0 && <p>Loading reviews...</p>}
            {error && <p className="booking-error">{error}</p>}
            {!loading && !error && reviews.length === 0 && (
                <p className="booking-empty">No reviews yet — be the first to review this movie.</p>
            )}

            <div className="movie-review-list">
                {reviews.map((review) => (
                    <div className="movie-review-item" key={review.id}>
                        <div className="movie-review-item-head">
                            <strong>{review.user?.name || 'Anonymous'}</strong>
                            <Stars value={review.rating} readOnly onChange={() => {}} />
                        </div>
                        <p className="movie-review-comment">{review.comment}</p>
                        <div className="movie-review-item-foot">
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {(review.user?.id || review.user) === currentUserId && (
                                <span className="movie-review-actions">
                                    <button type="button" className="link-button" onClick={() => startEdit(review)}>Edit</button>
                                    <button type="button" className="link-button" onClick={() => handleDelete(review)}>Delete</button>
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!loading && page < totalPages && (
                <button className="booking-back-btn" onClick={() => load(page + 1, false)}>
                    Load more reviews
                </button>
            )}
        </div>
    );
}

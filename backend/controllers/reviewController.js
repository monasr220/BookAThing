const ReviewService = require('../services/reviewService');
const { formatReviewResponse, formatReviewListResponse } = require('../responses/ReviewResponse');
const asyncHandler = require('../utils/asyncHandler');

// --- Create a new review ---
exports.createReview = asyncHandler(async (req, res) => {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.userId;

    const review = await ReviewService.createReview({
        movieId,
        userId,
        rating,
        comment
    });

    res.status(201).json(formatReviewResponse(review, 'Review created successfully'));
});

// --- Get all reviews for a movie ---
exports.getMovieReviews = asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const { page, limit } = req.query;

    const { reviews, totalItems, page: currentPage, limit: currentLimit, stats } = 
        await ReviewService.getReviewsByMovie(movieId, { page, limit });

    res.status(200).json(
        formatReviewListResponse(reviews, totalItems, currentPage, currentLimit, stats)
    );
});

// --- Update a review ---
exports.updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    const updatedReview = await ReviewService.updateReview(id, userId, { rating, comment });

    res.status(200).json(formatReviewResponse(updatedReview, 'Review updated successfully'));
});

// --- Delete a review ---
exports.deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    await ReviewService.deleteReview(id, userId);

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        data: { id }
    });
});
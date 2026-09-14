const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { getPagination, sanitizeComment } = require('../utils/reviewUtils');
const {
    ReviewNotFoundError,
    ReviewValidationError,
    DuplicateReviewError,
    UnauthorizedReviewActionError
} = require('../exceptions/reviewExceptions');

class ReviewService {
    static async createReview({ movieId, userId, rating, comment }) {
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            throw new ReviewValidationError('Invalid movie ID format', { movieId });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            throw new ReviewNotFoundError('Movie not found to add review', { movieId });
        }

        const existingReview = await Review.findOne({ movieId, userId });
        if (existingReview) {
            throw new DuplicateReviewError('You have already submitted a review for this movie', { movieId, userId });
        }

        const sanitized = sanitizeComment(comment);

        try {
            const review = new Review({
                movieId,
                userId,
                rating,
                comment: sanitized
            });

            await review.save();
            return await review.populate('userId', 'name username email');
        } catch (error) {
            if (error.code === 11000) {
                throw new DuplicateReviewError('A review already exists for this movie by this user', { movieId, userId });
            }
            throw error;
        }
    }

    static async getReviewsByMovie(movieId, { page = 1, limit = 10 }) {
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            throw new ReviewValidationError('Invalid movie ID format', { movieId });
        }

        const { page: currentPage, limit: currentLimit, skip } = getPagination(page, limit);

        const [reviews, totalItems, stats] = await Promise.all([
            Review.find({ movieId })
                .populate('userId', 'name username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(currentLimit),
            Review.countDocuments({ movieId }),
            ReviewService.getMovieRatingStats(movieId)
        ]);

        return {
            reviews,
            totalItems,
            page: currentPage,
            limit: currentLimit,
            stats
        };
    }

    static async updateReview(reviewId, userId, { rating, comment }) {
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            throw new ReviewValidationError('Invalid review ID format', { reviewId });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new ReviewNotFoundError('Review not found for update', { reviewId });
        }

        if (review.userId.toString() !== userId.toString()) {
            throw new UnauthorizedReviewActionError('You can only update your own review', { reviewId, userId });
        }

        if (rating !== undefined) {
            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                throw new ReviewValidationError('Rating must be between 1 and 5', { rating });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            const sanitized = sanitizeComment(comment);
            if (!sanitized) {
                throw new ReviewValidationError('Comment cannot be empty', { comment });
            }
            review.comment = sanitized;
        }

        await review.save();
        return await review.populate('userId', 'name username email');
    }

    static async deleteReview(reviewId, userId) {
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            throw new ReviewValidationError('Invalid review ID format', { reviewId });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new ReviewNotFoundError('Review not found for deletion', { reviewId });
        }

        if (review.userId.toString() !== userId.toString()) {
            throw new UnauthorizedReviewActionError('You can only delete your own review', { reviewId, userId });
        }

        await review.deleteOne();
        return review;
    }

    static async getMovieRatingStats(movieId) {
        const objectId = new mongoose.Types.ObjectId(movieId);
        const stats = await Review.aggregate([
            { $match: { movieId: objectId } },
            {
                $group: {
                    _id: '$movieId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        return {
            averageRating: stats[0].averageRating,
            totalReviews: stats[0].totalReviews
        };
    }
}

module.exports = ReviewService;
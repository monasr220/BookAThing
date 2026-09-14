/**
 * Formats a single Review document for standard API output.
 */
const formatReviewResponse = (review, message = 'Operation successful') => {
    return {
        success: true,
        message,
        data: {
            id: review._id,
            movieId: review.movieId?._id || review.movieId,
            movieTitle: review.movieId?.title || undefined,
            user: review.userId && typeof review.userId === 'object' ? {
                id: review.userId._id,
                name: review.userId.name || review.userId.username,
                email: review.userId.email
            } : review.userId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        }
    };
};

/**
 * Formats paginated list of reviews with summary statistics.
 */
const formatReviewListResponse = (reviews, totalItems, page, limit, stats = null, message = 'Reviews retrieved successfully') => {
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
        success: true,
        message,
        meta: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            stats: stats ? {
                averageRating: Number(stats.averageRating.toFixed(1)),
                totalReviews: stats.totalReviews
            } : null
        },
        data: reviews.map((review) => formatReviewResponse(review).data)
    };
};

module.exports = {
    formatReviewResponse,
    formatReviewListResponse
};
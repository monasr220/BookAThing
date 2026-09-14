const mongoose = require('mongoose');
const { ReviewValidationError } = require('../exceptions/reviewExceptions');

// Validates Route Param Object IDs
const validateReviewParams = (req, res, next) => {
    const { id, movieId } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ReviewValidationError('Invalid review ID format', { id });
    }
    if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ReviewValidationError('Invalid movie ID format', { movieId });
    }

    next();
};

// Validates Review Creation Body Parameters
const validateCreateReviewBody = (req, res, next) => {
    const { movieId, rating, comment } = req.body;
    const errors = {};

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
        errors.movieId = 'Valid movie ID is required';
    }

    if (rating === undefined || rating === null || typeof rating !== 'number') {
        errors.rating = 'Rating must be a valid number';
    } else if (rating < 1 || rating > 5) {
        errors.rating = 'Rating must be between 1 and 5';
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
        errors.comment = 'Comment must be a non-empty string';
    } else if (comment.trim().length > 1000) {
        errors.comment = 'Comment cannot exceed 1000 characters';
    }

    if (Object.keys(errors).length > 0) {
        throw new ReviewValidationError('Validation failed for review creation', errors);
    }

    next();
};

module.exports = {
    validateReviewParams,
    validateCreateReviewBody
};
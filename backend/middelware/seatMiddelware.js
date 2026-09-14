const mongoose = require('mongoose');
const { SeatValidationError } = require('../exceptions/seatExceptions');

/**
 * Validates route params for ObjectId compliance.
 */
const validateSeatParams = (req, res, next) => {
    const { screenId, showtimeId } = req.params;

    if (screenId && !mongoose.Types.ObjectId.isValid(screenId)) {
        throw new SeatValidationError('Invalid Screen ID format', { screenId });
    }
    if (showtimeId && !mongoose.Types.ObjectId.isValid(showtimeId)) {
        throw new SeatValidationError('Invalid Showtime ID format', { showtimeId });
    }

    next();
};

/**
 * Validates body payload for updating screen seats.
 */
const validateUpdateSeatsBody = (req, res, next) => {
    const { seats } = req.body;

    if (!Array.isArray(seats)) {
        throw new SeatValidationError('Seats must be provided as an array', { received: typeof seats });
    }

    if (seats.length === 0) {
        throw new SeatValidationError('Seats array cannot be empty');
    }

    next();
};

module.exports = {
    validateSeatParams,
    validateUpdateSeatsBody
};
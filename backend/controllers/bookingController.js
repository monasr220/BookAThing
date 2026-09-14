const bookingService = require('../services/bookingServices');

exports.createBooking = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const { movieId, theaterId, showtimeId, seats, promoCode, basePrice } = req.body;

        const result = await bookingService.createBooking(userId, {
            movieId,
            theaterId,
            showtimeId,
            seats,
            promoCode,
            basePrice
        });

        res.status(201).json({
            message: 'Booking created successfully!',
            booking: result.booking,
            subTotal: result.subTotal,
            discount: result.discount,
            appliedOffer: result.appliedOffer
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                message: error.message,
                unavailableSeats: error.unavailableSeats
            });
        }
        next(error);
    }
};

exports.getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const bookings = await bookingService.getUserBookings(userId);

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const { bookingId } = req.params;

        const cancelledBooking = await bookingService.cancelBooking(userId, bookingId);

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};
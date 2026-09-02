const bookingService = require('../services/bookingService');

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
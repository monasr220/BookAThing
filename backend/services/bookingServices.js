const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Screening = require('../models/Screening'); // movie_screening
const TheaterScreen = require('../models/TheaterScreen');
const { evaluateBestOffer } = require('../utils/OfferEngine');

class BookingService {

    async createBooking(userId, bookingData) {
        const { movieId, theaterId, showtimeId, seats, promoCode, basePrice = 100 } = bookingData;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. التحقق من وجود العرض (Screening)
            const screening = await Screening.findOne({
                _id: showtimeId,
                movie_id: movieId,
                theater_id: theaterId
            }).session(session).lean();

            if (!screening) {
                throw { status: 404, message: 'Screening showtime not found for this movie and theater.' };
            }

            // 2. جلب الشاشة وحساب سعر المقاعد
            const screen = await TheaterScreen.findById(screening.screen_id).session(session).lean();
            if (!screen) {
                throw { status: 404, message: 'Theater screen not found for this screening.' };
            }

            const screenSeatsMap = new Map(
                screen.seats.map(seat => [seat.seatNumber, seat.priceMultiplier || 1.0])
            );

            let calculatedSubtotal = 0;
            const invalidSeats = [];

            for (const seatNumber of seats) {
                if (!screenSeatsMap.has(seatNumber)) {
                    invalidSeats.push(seatNumber);
                } else {
                    const multiplier = screenSeatsMap.get(seatNumber);
                    calculatedSubtotal += basePrice * multiplier;
                }
            }

            if (invalidSeats.length > 0) {
                throw {
                    status: 400,
                    message: `Seats [${invalidSeats.join(', ')}] do not exist in screen "${screen.screenName}".`
                };
            }

            // 3. التحقق من عدم حجز المقاعد سابقاً
            const existingBookings = await Booking.find({
                showtimeId: showtimeId,
                status: { $in: ['pending', 'confirmed'] },
                seats: { $in: seats }
            }).session(session).lean();

            if (existingBookings.length > 0) {
                const alreadyBookedSeats = existingBookings.flatMap(b => b.seats);
                const unavailableSeats = seats.filter(seat => alreadyBookedSeats.includes(seat));
                throw {
                    status: 409,
                    message: `Seats [${unavailableSeats.join(', ')}] are already booked.`,
                    unavailableSeats
                };
            }

            // 4. التحقق مما إذا كان أول حجز للمستخدم
            const previousBookingsCount = await Booking.countDocuments({
                userId,
                status: { $in: ['pending', 'confirmed'] }
            }).session(session);

            const isFirstBooking = previousBookingsCount === 0;

            // 5. تجهيز السلة وتقييم أفضل عرض باستخدام OfferEngine
            const cart = {
                numTickets: seats.length,
                subTotal: calculatedSubtotal,
                movieId,
                isFirstBooking
            };

            const offerResult = await evaluateBestOffer(cart, promoCode);

            // 6. إنشاء الحجز وتخزين بيانات العرض والخصم
            const newBookingData = {
                userId,
                movieId,
                theaterId,
                showtimeId,
                seats,
                totalPrice: offerResult.finalTotal,
                offerId: offerResult.applied ? offerResult.applied.id : null,
                discountAmount: offerResult.discount,
                status: 'pending',
                paymentStatus: 'unpaid'
            };

            const createdBookings = await Booking.create([newBookingData], { session });
            await session.commitTransaction();

            return {
                booking: createdBookings[0],
                appliedOffer: offerResult.applied,
                subTotal: calculatedSubtotal,
                discount: offerResult.discount
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async cancelBooking(userId, bookingId) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { status: 404, message: 'Booking not found.' };
        }
        if (booking.userId.toString() !== userId) {
            throw { status: 403, message: 'Not authorized to cancel this booking.' };
        }
        if (booking.status === 'cancelled') {
            throw { status: 400, message: 'Booking is already cancelled.' };
        }

        booking.status = 'cancelled';
        booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : 'failed';

        await booking.save();
        return booking;
    }

    async getUserBookings(userId) {
        return await Booking.find({ userId })
            .populate('movieId', 'title poster_url')
            .populate('theaterId', 'name location')
            .populate({
                path: 'showtimeId',
                populate: { path: 'screen_id', select: 'screenName screenType' }
            })
            .populate('offerId', 'title discountType discountValue')
            .sort({ createdAt: -1 })
            .lean();
    }
}

module.exports = new BookingService();
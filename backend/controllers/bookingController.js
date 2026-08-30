vconst mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const { evaluateBestOffer, isCancellationAllowed, sendCancellationEmail } = require('../utils/bookingUtils');

class BookingService {
    
    // 1. إنشاء حجز جديد
    async createBooking(userId, showtimeId, seatIds) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const showtime = await Showtime.findById(showtimeId)
                .populate({ path: 'movie_id', select: 'title' })
                .populate({
                    path: 'screen_id',
                    select: 'screen_number theater_id',
                    populate: { path: 'theater_id', select: 'name city' }
                })
                .session(session)
                .lean();

            if (!showtime) throw { status: 404, message: 'Showtime not found.' };
            if (!showtime.movie_id || !showtime.screen_id || !showtime.screen_id.theater_id) {
                throw { status: 500, message: 'Internal error: Could not retrieve show details.' };
            }
            if (showtime.status !== 'scheduled') {
                throw { status: 400, message: `Cannot book for a showtime that is ${showtime.status}.` };
            }
            if (new Date(showtime.start_time) < new Date()) {
                throw { status: 400, message: 'Cannot book for a showtime that has already started.' };
            }

            // فحص المقاعد المتعارضة
            const conflictingBookings = await Booking.find({
                showtime_id: showtimeId,
                'booked_seats.seat_id': { $in: seatIds },
                status: { $in: ['active', 'paid', 'accepted', 'pending'] }
            }).select('booked_seats.seat_id').session(session).lean();

            const bookedSet = new Set();
            conflictingBookings.forEach(b => b.booked_seats.forEach(s => {
                if (seatIds.includes(s.seat_id.toString())) bookedSet.add(s.seat_id.toString());
            }));

            if (bookedSet.size > 0) {
                const unavailableSeats = await Seat.find({ _id: { $in: Array.from(bookedSet) } }).select('seat_number').lean();
                const numbers = unavailableSeats.map(s => s.seat_number);
                throw {
                    status: 409,
                    message: `Seat(s) ${numbers.join(', ')} are no longer available.`,
                    unavailableSeats: numbers
                };
            }

            // جلب المقاعد وتحديد السعر
            const seatsToBook = await Seat.find({ _id: { $in: seatIds }, screen_id: showtime.screen_id._id })
                .select('price seat_number').session(session).lean();

            if (seatsToBook.length !== seatIds.length) {
                throw { status: 400, message: 'Invalid seat selection or mismatch.' };
            }

            let subtotal = 0;
            const bookedSeats = seatsToBook.map(seat => {
                subtotal += seat.price;
                return { seat_id: seat._id, seat_number: seat.seat_number, price: seat.price };
            });

            // تطبيق الخصم
            const offer = await evaluateBestOffer(subtotal, userId, showtimeId);
            const totalAmount = Math.max(0, subtotal - offer.discountAmount);

            const bookingDoc = {
                user_id: userId,
                showtime_id: showtimeId,
                booked_seats: bookedSeats,
                subtotal_amount: subtotal,
                discount_amount: offer.discountAmount,
                total_amount: totalAmount,
                applied_offer: offer.appliedOfferId,
                status: 'pending',
                payment_status: 'pending'
            };

            const createdBookings = await Booking.create([bookingDoc], { session });
            await session.commitTransaction();

            return createdBookings[0];

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // 2. إلغاء حجز
    async cancelBooking(userId, bookingId) {
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'showtime_id',
                select: 'start_time screen_id movie_id',
                populate: [
                    { path: 'movie_id', select: 'title' },
                    {
                        path: 'screen_id',
                        select: 'screen_number theater_id',
                        populate: { path: 'theater_id', select: 'name city' }
                    }
                ]
            })
            .populate('user_id', 'name email')
            .lean();

        if (!booking) throw { status: 404, message: 'Booking not found.' };
        if (booking.user_id._id.toString() !== userId) {
            throw { status: 403, message: 'You are not authorized to cancel this booking.' };
        }
        if (!['active', 'paid', 'pending'].includes(booking.status)) {
            throw { status: 400, message: `Booking cannot be cancelled (status: ${booking.status}).` };
        }

        const showtime = booking.showtime_id;
        if (!isCancellationAllowed(showtime.start_time, 2)) {
            throw { status: 400, message: 'Cancellation deadline passed (less than 2 hours remaining).' };
        }

        const newPaymentStatus = booking.payment_status === 'paid' ? 'refund_pending' : 'cancelled';

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'user_cancelled', payment_status: newPaymentStatus },
            { new: true }
        ).lean();

        // إرسال بريد إلغاء غير متزامن (Asynchronous)
        sendCancellationEmail({
            user: booking.user_id,
            movie: showtime.movie_id,
            theater: showtime.screen_id.theater_id,
            screen: showtime.screen_id,
            showtime,
            updatedBooking
        }).catch(err => console.error(`[Email Failed] Booking ${bookingId}:`, err.message));

        return updatedBooking;
    }

    // 3. جلب حجوزات المستخدم
    async getUserBookings(userId) {
        const bookings = await Booking.find({ user_id: userId })
            .populate({
                path: 'showtime_id',
                select: 'start_time screen_id movie_id',
                populate: [
                    { path: 'movie_id', select: 'title poster_url' },
                    {
                        path: 'screen_id',
                        select: 'screen_number theater_id',
                        populate: { path: 'theater_id', select: 'name city' }
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        return bookings.map(b => ({
            _id: b._id,
            booking_date: b.createdAt,
            total_amount: b.total_amount,
            status: b.status,
            payment_status: b.payment_status,
            start_time: b.showtime_id?.start_time,
            movie_title: b.showtime_id?.movie_id?.title ?? 'N/A',
            poster_url: b.showtime_id?.movie_id?.poster_url ?? '/default_poster.jpg',
            theater_name: b.showtime_id?.screen_id?.theater_id?.name ?? 'N/A',
            theater_city: b.showtime_id?.screen_id?.theater_id?.city ?? 'N/A',
            screen_number: b.showtime_id?.screen_id?.screen_number ?? 'N/A',
            seat_numbers: b.booked_seats?.map(s => s.seat_number).join(', ') || 'N/A',
            number_of_seats: b.booked_seats?.length || 0
        }));
    }

    // 4. التتحقق من التذكرة (Staff)
    async verifyTicket(verifierTheaterId, bookingId, showtimeId) {
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'showtime_id',
                select: 'start_time screen_id movie_id',
                populate: [
                    {
                        path: 'screen_id',
                        select: 'theater_id screen_number',
                        populate: { path: 'theater_id', select: 'name _id' }
                    },
                    { path: 'movie_id', select: 'title' }
                ]
            })
            .populate('user_id', 'name email');

        if (!booking) throw { status: 404, message: 'Booking not found.' };
        if (booking.showtime_id._id.toString() !== showtimeId) {
            throw { status: 400, message: 'Ticket is not valid for this specific showtime.' };
        }

        const theaterIdFromBooking = booking.showtime_id?.screen_id?.theater_id?._id?.toString();
        if (theaterIdFromBooking !== verifierTheaterId) {
            throw { status: 403, message: 'Not authorized to verify tickets for this theater.' };
        }

        if (!['active', 'paid'].includes(booking.status) || booking.payment_status !== 'paid') {
            throw { status: 400, message: `Ticket invalid. Status: ${booking.status}, Payment: ${booking.payment_status}` };
        }

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: 'accepted' }, { new: true }).lean();

        return {
            success: true,
            booking_id: updatedBooking._id,
            movie_title: booking.showtime_id?.movie_id?.title ?? 'N/A',
            start_time: booking.showtime_id.start_time,
            theater_name: booking.showtime_id?.screen_id?.theater_id?.name ?? 'N/A',
            screen_number: booking.showtime_id?.screen_id?.screen_number ?? 'N/A',
            user_name: booking.user_id?.name ?? 'N/A',
            seat_numbers: booking.booked_seats?.map(s => s.seat_number) || [],
            status: updatedBooking.status
        };
    }

    // 5. إلغاء الحجوزات المعلقة تلقائياً (Cron Task)
    async cancelStalePendingBookings() {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const result = await Booking.updateMany(
            { payment_status: 'pending', status: 'pending', createdAt: { $lte: fifteenMinutesAgo } },
            { $set: { payment_status: 'failed', status: 'cancelled' } }
        );
        return { matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified };
    }
}

module.exports = new BookingService();
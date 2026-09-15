const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TheaterScreen = require('../models/theaterScreen');
const { formatRowName, parseSeatNumber, generateSeatIdentifier } = require('../utils/SeatUtils');
const {
    SeatNotFoundError,
    SeatValidationError,
    DuplicateSeatError
} = require('../exceptions/seatExceptions');

class SeatService {
    /**
     * Returns every seat configured on a screen, annotated with availability
     * for a specific showtime (based on existing pending/confirmed bookings).
     */
    static async getSeatLayout(screenId, showtimeId) {
        const screen = await TheaterScreen.findById(screenId).lean();
        if (!screen) {
            throw new SeatNotFoundError('Screen not found', { screenId });
        }

        const bookings = await Booking.find({
            showtimeId,
            status: { $in: ['pending', 'confirmed'] }
        }).select('seats').lean();

        const bookedSeatNumbers = new Set();
        bookings.forEach(booking => {
            (booking.seats || []).forEach(seatNumber => bookedSeatNumbers.add(seatNumber));
        });

        return screen.seats.map(seat => ({
            ...seat,
            screenId,
            is_available: !bookedSeatNumbers.has(seat.seatNumber)
        }));
    }

    /**
     * Returns the raw seat configuration for a screen (no availability data).
     */
    static async getScreenSeats(screenId) {
        const screen = await TheaterScreen.findById(screenId).select('seats').lean();
        if (!screen) {
            throw new SeatNotFoundError('Screen not found', { screenId });
        }

        return screen.seats.map(seat => ({ ...seat, screenId }));
    }

    /**
     * Replaces the entire seat layout for a screen.
     * Expects an array of { row, number_in_row, seat_type, priceMultiplier }.
     */
    static async updateScreenSeats(screenId, seatsData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const screen = await TheaterScreen.findById(screenId).session(session);
            if (!screen) {
                throw new SeatNotFoundError('Screen not found for update', { screenId });
            }

            const seatsToCreate = [];
            const allSeatIdentifiers = new Set();

            for (const seat of seatsData) {
                const rowName = formatRowName(seat.row);
                const seatNum = parseSeatNumber(seat.number_in_row);

                if (seatNum === null) {
                    throw new SeatValidationError(`Invalid seat number in row '${rowName}'. Must be a positive number.`, {
                        row: rowName,
                        number_in_row: seat.number_in_row
                    });
                }

                const seatIdentifier = generateSeatIdentifier(rowName, seatNum);
                if (allSeatIdentifiers.has(seatIdentifier)) {
                    throw new DuplicateSeatError(`Duplicate seat number '${seatIdentifier}' detected.`, {
                        seatIdentifier
                    });
                }
                allSeatIdentifiers.add(seatIdentifier);

                seatsToCreate.push({
                    seatNumber: seatIdentifier,
                    seatType: seat.seat_type ? seat.seat_type.trim() : 'standard',
                    priceMultiplier: seat.priceMultiplier || 1.0
                });
            }

            screen.seats = seatsToCreate;
            screen.capacity = seatsToCreate.length;
            await screen.save({ session });

            await session.commitTransaction();
            session.endSession();

            return screen.seats.map(seat => ({ ...seat.toObject(), screenId }));
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            if (error.code === 11000) {
                throw new DuplicateSeatError('Database constraint conflict: possible duplicate seat numbers', { error: error.message });
            }
            throw error;
        }
    }
}

module.exports = SeatService;

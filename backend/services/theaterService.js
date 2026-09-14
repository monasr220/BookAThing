const mongoose = require('mongoose');
const Theater = require('../models/theater');
const TheaterScreen = require('../models/theaterScreen');
const Screening = require('../models/screening');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');

class TheaterService {
    // --- Theaters ---

    static async createTheater(ownerId, data) {
        const { name, location, phone, amenities } = data;
        return await Theater.create({ name, location, phone, amenities, ownerId });
    }

    static async getAllTheaters(city) {
        const filter = city ? { 'location.city': city } : {};
        return await Theater.find(filter).sort({ name: 1 });
    }

    static async getTheaterById(id) {
        const theater = await Theater.findById(id);
        if (!theater) {
            throw new NotFoundError('Theater');
        }
        return theater;
    }

    static async getTheatersByOwner(ownerId) {
        return await Theater.find({ ownerId }).sort({ name: 1 });
    }

    static async updateTheater(id, data) {
        const allowedUpdates = (({ name, location, phone, amenities }) => ({ name, location, phone, amenities }))(data);
        const theater = await Theater.findByIdAndUpdate(id, allowedUpdates, { returnDocument: 'after', runValidators: true });
        if (!theater) {
            throw new NotFoundError('Theater');
        }
        return theater;
    }

    static async deleteTheater(id) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const screens = await TheaterScreen.find({ theaterId: id }).select('_id').session(session);
            const screenIds = screens.map(s => s._id);

            if (screenIds.length > 0) {
                const activeScreenings = await Screening.countDocuments({
                    screen_id: { $in: screenIds },
                    status: 'scheduled',
                    start_time: { $gte: new Date() }
                }).session(session);

                if (activeScreenings > 0) {
                    throw new ValidationError(
                        'Cannot delete theater with upcoming scheduled screenings. Cancel them first.',
                        'theaterId'
                    );
                }
            }

            await TheaterScreen.deleteMany({ theaterId: id }).session(session);
            const deletedTheater = await Theater.findByIdAndDelete(id).session(session);

            if (!deletedTheater) {
                throw new NotFoundError('Theater');
            }

            await session.commitTransaction();
            session.endSession();
            return deletedTheater;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // --- Screens ---

    static async createScreen(theaterId, data) {
        await TheaterService.getTheaterById(theaterId); // throws NotFoundError if missing

        const { screenName, screenType, totalRows, seatsPerRow } = data;
        return await TheaterScreen.create({
            theaterId,
            screenName,
            screenType,
            capacity: totalRows * seatsPerRow,
            totalRows,
            seatsPerRow,
            seats: []
        });
    }

    static async getScreensByTheater(theaterId) {
        return await TheaterScreen.find({ theaterId }).select('-seats');
    }

    static async getScreenById(screenId) {
        const screen = await TheaterScreen.findById(screenId);
        if (!screen) {
            throw new NotFoundError('Screen');
        }
        return screen;
    }

    static async updateScreen(screenId, data) {
        const allowedUpdates = (({ screenName, screenType, totalRows, seatsPerRow }) =>
            ({ screenName, screenType, totalRows, seatsPerRow }))(data);

        if (allowedUpdates.totalRows !== undefined && allowedUpdates.seatsPerRow !== undefined) {
            allowedUpdates.capacity = allowedUpdates.totalRows * allowedUpdates.seatsPerRow;
        }

        const screen = await TheaterScreen.findByIdAndUpdate(screenId, allowedUpdates, { returnDocument: 'after', runValidators: true });
        if (!screen) {
            throw new NotFoundError('Screen');
        }
        return screen;
    }

    static async deleteScreen(screenId) {
        const upcomingScreenings = await Screening.countDocuments({
            screen_id: screenId,
            status: 'scheduled',
            start_time: { $gte: new Date() }
        });

        if (upcomingScreenings > 0) {
            throw new ValidationError(
                'Cannot delete a screen with upcoming scheduled showtimes. Cancel them first.',
                'screenId'
            );
        }

        const deletedScreen = await TheaterScreen.findByIdAndDelete(screenId);
        if (!deletedScreen) {
            throw new NotFoundError('Screen');
        }
        return deletedScreen;
    }
}

module.exports = TheaterService;

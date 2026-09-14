const Screening = require('../models/screening');
const Movie = require('../models/Movie');
const Theater = require('../models/theater');
const TheaterScreen = require('../models/theaterScreen');
const Booking = require('../models/Booking');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');

class ShowTimeService {
    static async createShowtime(data) {
        const { movieId, theaterId, screenId, startTime, language } = data;

        const [movie, theater, screen] = await Promise.all([
            Movie.findById(movieId).select('_id'),
            Theater.findById(theaterId).select('_id'),
            TheaterScreen.findById(screenId).select('_id theaterId')
        ]);

        if (!movie) throw new NotFoundError('Movie');
        if (!theater) throw new NotFoundError('Theater');
        if (!screen) throw new NotFoundError('Screen');

        if (screen.theaterId.toString() !== theaterId) {
            throw new ValidationError('Screen does not belong to the specified theater', 'screenId');
        }

        // Prevent overlapping showtimes on the same screen at the exact same start time
        const conflict = await Screening.findOne({
            screen_id: screenId,
            start_time: new Date(startTime),
            status: 'scheduled'
        });

        if (conflict) {
            throw new ValidationError('A showtime is already scheduled for this screen at this time', 'startTime');
        }

        return await Screening.create({
            movie_id: movieId,
            theater_id: theaterId,
            screen_id: screenId,
            start_time: startTime,
            language
        });
    }

    static async getShowtimeById(id) {
        const showtime = await Screening.findById(id)
            .populate('movie_id', 'title poster_url duration')
            .populate('theater_id', 'name location')
            .populate('screen_id', 'screenName screenType');

        if (!showtime) {
            throw new NotFoundError('Showtime');
        }
        return showtime;
    }

    static async getShowtimesByMovie(movieId, { theaterId, fromDate } = {}) {
        const filter = {
            movie_id: movieId,
            status: 'scheduled',
            start_time: { $gte: fromDate ? new Date(fromDate) : new Date() }
        };
        if (theaterId) filter.theater_id = theaterId;

        return await Screening.find(filter)
            .populate('theater_id', 'name location')
            .populate('screen_id', 'screenName screenType')
            .sort({ start_time: 1 });
    }

    static async getShowtimesByTheater(theaterId, { date } = {}) {
        const filter = { theater_id: theaterId, status: 'scheduled' };

        if (date) {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            filter.start_time = { $gte: dayStart, $lt: dayEnd };
        } else {
            filter.start_time = { $gte: new Date() };
        }

        return await Screening.find(filter)
            .populate('movie_id', 'title poster_url duration')
            .populate('screen_id', 'screenName screenType')
            .sort({ start_time: 1 });
    }

    static async updateShowtime(id, data) {
        const allowedUpdates = (({ startTime, language }) => {
            const update = {};
            if (startTime !== undefined) update.start_time = startTime;
            if (language !== undefined) update.language = language;
            return update;
        })(data);

        const showtime = await Screening.findByIdAndUpdate(id, allowedUpdates, { returnDocument: 'after', runValidators: true });
        if (!showtime) {
            throw new NotFoundError('Showtime');
        }
        return showtime;
    }

    static async cancelShowtime(id) {
        const showtime = await Screening.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { returnDocument: 'after' }
        );
        if (!showtime) {
            throw new NotFoundError('Showtime');
        }
        return showtime;
    }

    static async deleteShowtime(id) {
        const existingBookings = await Booking.countDocuments({
            showtimeId: id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBookings > 0) {
            throw new ValidationError(
                'Cannot delete a showtime with active bookings. Cancel it instead.',
                'showtimeId'
            );
        }

        const deleted = await Screening.findByIdAndDelete(id);
        if (!deleted) {
            throw new NotFoundError('Showtime');
        }
        return deleted;
    }
}

module.exports = ShowTimeService;

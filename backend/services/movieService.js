const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Theater = require('../models/Theater');
const { getStartOfToday } = require('../utils/dateUtils');

class MovieService {
    static async fetchAllMovies(){
        return await Movie.find().sort({title:1});
    }

    static async fetchMovieWithShowTimes(id){
        const movie = await Movie.findById(id);
        if(!movie) return null;

        const todayStart = getStartOfToday();
        const showtimes = await Showtime.find({
            movie_id:id,
            start_time : {$gte:todayStart}
        })
        .select('start_time theater_id screen_id language')
        .populate('theater_id' , 'name location')
        .populate('screen_id','screenName screenType')
        .sort({start_time: 1});

        return {movie , showtimes};
    }

    static async searchMovieByTitle(queryStr){
        const searchRegex = new RegExp(queryStr.trim(), 'i');
        return await Movie.find({title:{$regex:searchRegex}})
        .select('_id title poster_url');
    }

    static async createNewMovie(movieData){
        return await Movie.create(movieData);
    }
    static async updateMovieById(id,updateDate){
        return await Movie.findByIdAndUpdate(
            id,
            updateDate,
            {new : true , runValidators:true}
        );
    }
static async fetchNowInCinemas(city) {
        const todayStart = getStartOfToday();
        
        // Fixed: Use nested property 'location.city' as defined in Theater schema
        const theatersInCity = await Theater.find({ 'location.city': city }).select('_id').lean();
        if (!theatersInCity.length) return [];

        const theaterIdsInCity = theatersInCity.map(t => t._id);

        return await Showtime.aggregate([
            {
                $match: {
                    start_time: { $gte: todayStart },
                    theater_id: { $in: theaterIdsInCity }
                }
            },
            {
                $group: {
                    _id: "$movie_id",
                    show_count: { $sum: 1 }
                }
            },
            { $sort: { show_count: -1 } },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    _id: "$movieDetails._id",
                    title: "$movieDetails.title",
                    genre: "$movieDetails.genre",
                    duration: "$movieDetails.duration",
                    releaseDate: "$movieDetails.releaseDate",
                    language: "$movieDetails.language",
                    description: "$movieDetails.description",
                    poster_url: "$movieDetails.poster_url",
                    trailer_url: "$movieDetails.trailer_url",
                    show_count: "$show_count"
                }
            }
        ]);
    }

    static async fetchComingSoonMoviesPage() {
        const today = new Date();
        const movieIdsWithShowtimes = await Showtime.distinct('movie_id');

        return await Movie.find({
            _id: { $nin: movieIdsWithShowtimes },
            releaseDate: { $gt: today }
        }).sort({ releaseDate: -1 });
    }

    static async fetchPopularMovies(city) {
        const todayStart = getStartOfToday();
        const theatersInCity = await Theater.find({ 'location.city': city }).select('_id').lean();
        if (!theatersInCity.length) return [];

        const theaterIdsInCity = theatersInCity.map(t => t._id);

        return await Showtime.aggregate([
            {
                $match: {
                    start_time: { $gte: todayStart },
                    status: 'scheduled',
                    theater_id: { $in: theaterIdsInCity }
                }
            },
            {
                $group: {
                    _id: "$movie_id",
                    show_count: { $sum: 1 }
                }
            },
            { $sort: { show_count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    _id: "$movieDetails._id",
                    title: "$movieDetails.title",
                    genre: "$movieDetails.genre",
                    poster_url: "$movieDetails.poster_url",
                    show_count: "$show_count"
                }
            }
        ]);
    }

    static async fetchUpcomingMovies() {
        const today = new Date();
        const movieIdsWithShowtimes = await Showtime.distinct('movie_id');

        return await Movie.find({
            _id: { $nin: movieIdsWithShowtimes },
            releaseDate: { $gt: today }
        })
            .sort({ releaseDate: 1 })
            .limit(5)
            .select('_id title poster_url releaseDate genre');
    }

    static async fetchBookingStats(movieId, timeframe) {
        const startDate = timeframe === '1h'
            ? new Date(Date.now() - 60 * 60 * 1000)
            : new Date(Date.now() - 24 * 60 * 60 * 1000);

        const showtimes = await Showtime.find({ movie_id: movieId }).select('_id').lean();
        const showtimeIds = showtimes.map(st => st._id);

        if (showtimeIds.length === 0) return 0;

        const stats = await Booking.aggregate([
            {
                $match: {
                    showtime_id: { $in: showtimeIds },
                    status: 'active',
                    booking_date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: { $size: "$booked_seats" } }
                }
            }
        ]);

        return stats.length > 0 ? stats[0].totalTickets : 0;
    }

    static async deleteMovieCascade(id) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const showtimesToDelete = await Showtime.find({ movie_id: id }).select('_id').session(session);
            const showtimeIds = showtimesToDelete.map(st => st._id);

            if (showtimeIds.length > 0) {
                const bookingsToDelete = await Booking.find({ showtime_id: { $in: showtimeIds } }).select('_id').session(session);
                const bookingIds = bookingsToDelete.map(b => b._id);

                if (bookingIds.length > 0) {
                    await Payment.deleteMany({ booking_id: { $in: bookingIds } }).session(session);
                    await Booking.deleteMany({ _id: { $in: bookingIds } }).session(session);
                }
                await Showtime.deleteMany({ _id: { $in: showtimeIds } }).session(session);
            }

            const deletedMovie = await Movie.findByIdAndDelete(id).session(session);
            if (!deletedMovie) {
                await session.abortTransaction();
                session.endSession();
                return null;
            }

            await session.commitTransaction();
            session.endSession();
            return deletedMovie;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = MovieService;
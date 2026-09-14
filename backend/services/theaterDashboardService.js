const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Screening = require('../models/screening');
const Theater = require('../models/theater');
const NotFoundError = require('../exceptions/NotFoundError');

class TheaterDashboardService {
    static async _assertTheaterExists(theaterId) {
        const theater = await Theater.findById(theaterId).select('_id').lean();
        if (!theater) {
            throw new NotFoundError('Theater');
        }
    }

    static async getOverview(theaterId, { fromDate, toDate } = {}) {
        await TheaterDashboardService._assertTheaterExists(theaterId);

        const dateFilter = {};
        if (fromDate) dateFilter.$gte = new Date(fromDate);
        if (toDate) dateFilter.$lte = new Date(toDate);

        const match = {
            theaterId: new mongoose.Types.ObjectId(theaterId),
            status: { $ne: 'cancelled' }
        };
        if (Object.keys(dateFilter).length > 0) {
            match.createdAt = dateFilter;
        }

        const [stats] = await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalTicketsSold: { $sum: { $size: '$seats' } },
                    totalRevenue: { $sum: '$totalPrice' },
                    totalDiscountGiven: { $sum: '$discountAmount' }
                }
            }
        ]);

        const upcomingShowtimesCount = await Screening.countDocuments({
            theater_id: theaterId,
            status: 'scheduled',
            start_time: { $gte: new Date() }
        });

        return {
            totalBookings: stats?.totalBookings || 0,
            totalTicketsSold: stats?.totalTicketsSold || 0,
            totalRevenue: stats?.totalRevenue || 0,
            totalDiscountGiven: stats?.totalDiscountGiven || 0,
            upcomingShowtimesCount
        };
    }

    static async getRevenueByMovie(theaterId, { fromDate, toDate } = {}) {
        await TheaterDashboardService._assertTheaterExists(theaterId);

        const dateFilter = {};
        if (fromDate) dateFilter.$gte = new Date(fromDate);
        if (toDate) dateFilter.$lte = new Date(toDate);

        const match = {
            theaterId: new mongoose.Types.ObjectId(theaterId),
            status: { $ne: 'cancelled' }
        };
        if (Object.keys(dateFilter).length > 0) {
            match.createdAt = dateFilter;
        }

        return await Booking.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$movieId',
                    ticketsSold: { $sum: { $size: '$seats' } },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'movie'
                }
            },
            { $unwind: '$movie' },
            {
                $project: {
                    _id: 0,
                    movieId: '$movie._id',
                    title: '$movie.title',
                    posterUrl: '$movie.poster_url',
                    ticketsSold: 1,
                    revenue: 1,
                    bookings: 1
                }
            }
        ]);
    }

    static async getUpcomingShowtimes(theaterId) {
        await TheaterDashboardService._assertTheaterExists(theaterId);

        return await Screening.find({
            theater_id: theaterId,
            status: 'scheduled',
            start_time: { $gte: new Date() }
        })
            .populate('movie_id', 'title poster_url')
            .populate('screen_id', 'screenName screenType')
            .sort({ start_time: 1 });
    }
}

module.exports = TheaterDashboardService;

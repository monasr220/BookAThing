const TheaterDashboardService = require('../services/theaterDashboardService');
const asyncHandler = require('../utils/asyncHandler');
const SuccessResponse = require('../responses/SuccessResponse');

// --- High-level overview: bookings, tickets sold, revenue, upcoming showtimes ---
exports.getOverview = asyncHandler(async (req, res) => {
    const { theaterId } = req.params;
    const { fromDate, toDate } = req.query;
    const overview = await TheaterDashboardService.getOverview(theaterId, { fromDate, toDate });
    new SuccessResponse(overview, 'Dashboard overview retrieved successfully').send(res);
});

// --- Revenue and tickets sold, broken down per movie ---
exports.getRevenueByMovie = asyncHandler(async (req, res) => {
    const { theaterId } = req.params;
    const { fromDate, toDate } = req.query;
    const breakdown = await TheaterDashboardService.getRevenueByMovie(theaterId, { fromDate, toDate });
    new SuccessResponse(breakdown, 'Revenue by movie retrieved successfully').send(res);
});

// --- All upcoming scheduled showtimes for the theater ---
exports.getUpcomingShowtimes = asyncHandler(async (req, res) => {
    const { theaterId } = req.params;
    const showtimes = await TheaterDashboardService.getUpcomingShowtimes(theaterId);
    new SuccessResponse(showtimes, 'Upcoming showtimes retrieved successfully').send(res);
});

const ShowTimeService = require('../services/showTimeService');
const asyncHandler = require('../utils/asyncHandler');
const CreateResponse = require('../responses/CreateResponse');
const SuccessResponse = require('../responses/SuccessResponse');

// --- Create a new showtime (screening) ---
exports.createShowtime = asyncHandler(async (req, res) => {
    const showtime = await ShowTimeService.createShowtime(req.body);
    new CreateResponse(showtime, 'Showtime created successfully').send(res);
});

// --- Get a single showtime by ID ---
exports.getShowtimeById = asyncHandler(async (req, res) => {
    const showtime = await ShowTimeService.getShowtimeById(req.params.id);
    new SuccessResponse(showtime, 'Showtime retrieved successfully').send(res);
});

// --- Get upcoming showtimes for a movie (optionally filtered by theater) ---
exports.getShowtimesByMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const { theaterId, fromDate } = req.query;
    const showtimes = await ShowTimeService.getShowtimesByMovie(movieId, { theaterId, fromDate });
    new SuccessResponse(showtimes, 'Showtimes retrieved successfully').send(res);
});

// --- Get showtimes for a theater, optionally for a specific date ---
exports.getShowtimesByTheater = asyncHandler(async (req, res) => {
    const { theaterId } = req.params;
    const { date } = req.query;
    const showtimes = await ShowTimeService.getShowtimesByTheater(theaterId, { date });
    new SuccessResponse(showtimes, 'Showtimes retrieved successfully').send(res);
});

// --- Update a showtime's start time or language ---
exports.updateShowtime = asyncHandler(async (req, res) => {
    const showtime = await ShowTimeService.updateShowtime(req.params.id, req.body);
    new SuccessResponse(showtime, 'Showtime updated successfully').send(res);
});

// --- Cancel a showtime (soft delete; keeps history for existing bookings) ---
exports.cancelShowtime = asyncHandler(async (req, res) => {
    const showtime = await ShowTimeService.cancelShowtime(req.params.id);
    new SuccessResponse(showtime, 'Showtime cancelled successfully').send(res);
});

// --- Permanently delete a showtime (blocked if it has active bookings) ---
exports.deleteShowtime = asyncHandler(async (req, res) => {
    await ShowTimeService.deleteShowtime(req.params.id);
    new SuccessResponse({ id: req.params.id }, 'Showtime deleted successfully').send(res);
});

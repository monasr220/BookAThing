const SeatService = require('../services/seatService');
const { formatSeatListResponse } = require('../responses/seatResponse');
const asyncHandler = require('../utils/asyncHandler');

// --- Get seat availability layout for a showtime ---
exports.getSeatLayout = asyncHandler(async (req, res) => {
    const { screenId, showtimeId } = req.params;
    const seatLayout = await SeatService.getSeatLayout(screenId, showtimeId);

    res.status(200).json(formatSeatListResponse(seatLayout, 'Seat layout retrieved successfully'));
});

// --- Get all seats configured for a screen ---
exports.getScreenSeats = asyncHandler(async (req, res) => {
    const { screenId } = req.params;
    const seats = await SeatService.getScreenSeats(screenId);

    res.status(200).json(formatSeatListResponse(seats, 'Screen seats retrieved successfully'));
});

// --- Update all seats for a screen ---
exports.updateScreenSeats = asyncHandler(async (req, res) => {
    const { screenId } = req.params;
    const { seats } = req.body;

    const updatedSeats = await SeatService.updateScreenSeats(screenId, seats);

    res.status(200).json(formatSeatListResponse(updatedSeats, 'Seats updated successfully'));
});
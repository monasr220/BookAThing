/**
 * Formats a single seat subdocument (from TheaterScreen.seats) for API output.
 */
const formatSeatResponse = (seat, screenId = undefined) => {
    return {
        id: seat._id,
        screenId: seat.screenId || screenId,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        priceMultiplier: seat.priceMultiplier,
        isAvailable: seat.is_available !== undefined ? seat.is_available : true
    };
};

/**
 * Formats a list of seats for layout or configuration responses.
 */
const formatSeatListResponse = (seats, message = 'Seats retrieved successfully') => {
    return {
        success: true,
        message,
        count: seats.length,
        data: seats.map((seat) => formatSeatResponse(seat))
    };
};

module.exports = {
    formatSeatResponse,
    formatSeatListResponse
};

const TheaterService = require('../services/theaterService');
const asyncHandler = require('../utils/asyncHandler');
const CreateResponse = require('../responses/CreateResponse');
const SuccessResponse = require('../responses/SuccessResponse');

// --- Theaters ---

// --- Create a new theater (owned by the authenticated user) ---
exports.createTheater = asyncHandler(async (req, res) => {
    const ownerId = req.user.userId;
    const theater = await TheaterService.createTheater(ownerId, req.body);
    new CreateResponse(theater, 'Theater created successfully').send(res);
});

// --- Get all theaters (optionally filtered by city) ---
exports.getAllTheaters = asyncHandler(async (req, res) => {
    const theaters = await TheaterService.getAllTheaters(req.query.city);
    new SuccessResponse(theaters, 'Theaters retrieved successfully').send(res);
});

// --- Get a single theater by ID ---
exports.getTheaterById = asyncHandler(async (req, res) => {
    const theater = await TheaterService.getTheaterById(req.params.theaterId);
    new SuccessResponse(theater, 'Theater retrieved successfully').send(res);
});

// --- Get theaters owned by the authenticated user ---
exports.getMyTheaters = asyncHandler(async (req, res) => {
    const theaters = await TheaterService.getTheatersByOwner(req.user.userId);
    new SuccessResponse(theaters, 'Theaters retrieved successfully').send(res);
});

// --- Update a theater ---
exports.updateTheater = asyncHandler(async (req, res) => {
    const theater = await TheaterService.updateTheater(req.params.theaterId, req.body);
    new SuccessResponse(theater, 'Theater updated successfully').send(res);
});

// --- Delete a theater (and its screens, if no active showtimes remain) ---
exports.deleteTheater = asyncHandler(async (req, res) => {
    await TheaterService.deleteTheater(req.params.theaterId);
    new SuccessResponse({ id: req.params.theaterId }, 'Theater deleted successfully').send(res);
});

// --- Screens ---

// --- Create a new screen for a theater ---
exports.createScreen = asyncHandler(async (req, res) => {
    const screen = await TheaterService.createScreen(req.params.theaterId, req.body);
    new CreateResponse(screen, 'Screen created successfully').send(res);
});

// --- Get all screens for a theater ---
exports.getScreensByTheater = asyncHandler(async (req, res) => {
    const screens = await TheaterService.getScreensByTheater(req.params.theaterId);
    new SuccessResponse(screens, 'Screens retrieved successfully').send(res);
});

// --- Get a single screen by ID ---
exports.getScreenById = asyncHandler(async (req, res) => {
    const screen = await TheaterService.getScreenById(req.params.screenId);
    new SuccessResponse(screen, 'Screen retrieved successfully').send(res);
});

// --- Update a screen's metadata ---
exports.updateScreen = asyncHandler(async (req, res) => {
    const screen = await TheaterService.updateScreen(req.params.screenId, req.body);
    new SuccessResponse(screen, 'Screen updated successfully').send(res);
});

// --- Delete a screen (blocked if it has upcoming scheduled showtimes) ---
exports.deleteScreen = asyncHandler(async (req, res) => {
    await TheaterService.deleteScreen(req.params.screenId);
    new SuccessResponse({ id: req.params.screenId }, 'Screen deleted successfully').send(res);
});

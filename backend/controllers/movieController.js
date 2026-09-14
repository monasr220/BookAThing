const MovieService = require('../services/movieService');
const asyncHandler = require('../utils/asyncHandler');

// --- Get all movies ---
exports.getAllMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.fetchAllMovies();
    res.status(200).json(movies);
});

// --- Get a single movie by ID with showtimes ---
exports.getMovieById = asyncHandler(async (req, res) => {
    const data = await MovieService.fetchMovieWithShowtimes(req.params.id);
    if (!data) {
        return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(data);
});

// --- Search movies by title ---
exports.searchMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.searchMoviesByTitle(req.query.query);
    res.status(200).json(movies);
});

// --- Create a new movie ---
exports.createMovie = asyncHandler(async (req, res) => {
    const newMovie = await MovieService.createNewMovie(req.body);
    res.status(201).json({ message: 'Movie created successfully', movie: newMovie });
});

// --- Update an existing movie ---
exports.updateMovie = asyncHandler(async (req, res) => {
    const updatedMovie = await MovieService.updateMovieById(req.params.id, req.body);
    if (!updatedMovie) {
        return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
});

// --- Get "Now in Cinemas" Movies ---
exports.getNowInCinemasMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.fetchNowInCinemas(req.query.city);
    res.status(200).json(movies);
});

// --- Get "Coming Soon" Movies Page ---
exports.getComingSoonMoviesPage = asyncHandler(async (req, res) => {
    const movies = await MovieService.fetchComingSoonMoviesPage();
    res.status(200).json(movies);
});

// --- Get Popular Movies ---
exports.getPopularMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.fetchPopularMovies(req.query.city);
    res.status(200).json(movies);
});

// --- Get Upcoming Movies ---
exports.getUpcomingMovies = asyncHandler(async (req, res) => {
    const movies = await MovieService.fetchUpcomingMovies();
    res.status(200).json(movies);
});

// --- Get Booking Stats for a Movie ---
exports.getBookingStatsForMovie = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { timeframe } = req.query;
    const ticketCount = await MovieService.fetchBookingStats(id, timeframe);
    res.status(200).json({ ticketCount });
});

// --- Delete a movie and cascaded resources ---
exports.deleteMovie = asyncHandler(async (req, res) => {
    const deletedMovie = await MovieService.deleteMovieCascade(req.params.id);
    if (!deletedMovie) {
        return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie and associated data deleted successfully', movieId: req.params.id });
});
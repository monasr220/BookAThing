const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');
const { authenticateJWT, authorizeRoles } = require('../middelware/AuthMiddleWare');
const { validateMovieId, validateSearchQuery } = require('../middelware/movieMiddleware');

// --- Public browsing routes ---

router.get('/', movieController.getAllMovies);

router.get('/search', validateSearchQuery, movieController.searchMovies);

router.get('/now-in-cinemas', movieController.getNowInCinemasMovies);

router.get('/coming-soon', movieController.getComingSoonMoviesPage);

router.get('/popular', movieController.getPopularMovies);

router.get('/upcoming', movieController.getUpcomingMovies);

router.get('/:id', validateMovieId, movieController.getMovieById);

router.get('/:id/booking-stats', validateMovieId, authenticateJWT, authorizeRoles('admin', 'owner'), movieController.getBookingStatsForMovie);

// --- Admin-only management routes ---

router.post('/', authenticateJWT, authorizeRoles('admin'), movieController.createMovie);

router.put('/:id', validateMovieId, authenticateJWT, authorizeRoles('admin'), movieController.updateMovie);

router.delete('/:id', validateMovieId, authenticateJWT, authorizeRoles('admin'), movieController.deleteMovie);

module.exports = router;

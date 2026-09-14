const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/theaterDashBoardController');
const { authenticateJWT, authorizeTheatreAdmin } = require('../middelware/AuthMiddleWare');
const { validateTheaterId } = require('../middelware/theaterMiddleware');

router.get('/:theaterId/dashboard/overview', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, dashboardController.getOverview);

router.get('/:theaterId/dashboard/revenue-by-movie', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, dashboardController.getRevenueByMovie);

router.get('/:theaterId/dashboard/upcoming-showtimes', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, dashboardController.getUpcomingShowtimes);

module.exports = router;

const express = require('express');
const router = express.Router();

const showTimeController = require('../controllers/showTimeController');
const { authenticateJWT, authorizeRoles } = require('../middelware/AuthMiddleWare');
const {
    validateShowtimeParams,
    createShowtimeRules,
    updateShowtimeRules
} = require('../middelware/showTimeMiddleware');

// NOTE: ownership of the theater referenced in the request body isn't cross-checked
// here (authorizeTheatreAdmin only validates a :theaterId route param, not a body
// field) — an "owner" can currently schedule showtimes for any theater. Tightening
// this would need a body-aware variant of authorizeTheatreAdmin.

router.post('/', authenticateJWT, authorizeRoles('owner', 'admin'), createShowtimeRules, showTimeController.createShowtime);

router.get('/movie/:movieId', validateShowtimeParams, showTimeController.getShowtimesByMovie);

router.get('/theater/:theaterId', validateShowtimeParams, showTimeController.getShowtimesByTheater);

router.get('/:id', validateShowtimeParams, showTimeController.getShowtimeById);
router.put('/:id', authenticateJWT, authorizeRoles('owner', 'admin'), validateShowtimeParams, updateShowtimeRules, showTimeController.updateShowtime);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), validateShowtimeParams, showTimeController.deleteShowtime);

router.patch('/:id/cancel', authenticateJWT, authorizeRoles('owner', 'admin'), validateShowtimeParams, showTimeController.cancelShowtime);

module.exports = router;

const express = require('express');
const router = express.Router();

const seatController = require('../controllers/seatController');
const { authenticateJWT, authorizeRoles } = require('../middelware/AuthMiddleWare');
const { validateSeatParams, validateUpdateSeatsBody } = require('../middelware/seatMiddelware');

router.get('/screen/:screenId/layout/:showtimeId', validateSeatParams, seatController.getSeatLayout);

router.get('/screen/:screenId', validateSeatParams, seatController.getScreenSeats);

router.put('/screen/:screenId', authenticateJWT, authorizeRoles('admin', 'owner'), validateSeatParams, validateUpdateSeatsBody, seatController.updateScreenSeats);

module.exports = router;

const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { authenticateJWT } = require('../middelware/AuthMiddleWare');
const { validateCreateBooking } = require('../middelware/bookingMiddleware');

router.post('/', authenticateJWT, validateCreateBooking, bookingController.createBooking);

module.exports = router;

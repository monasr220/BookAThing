const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticateJWT, authorizeRoles } = require('../middelware/AuthMiddleWare');
const { validatePaymentParams, processPaymentRules } = require('../middelware/paymentMiddleware');

router.post('/', authenticateJWT, processPaymentRules, paymentController.processPayment);

router.get('/booking/:bookingId', authenticateJWT, validatePaymentParams, paymentController.getPaymentByBooking);

router.post('/:id/refund', authenticateJWT, authorizeRoles('admin', 'owner'), validatePaymentParams, paymentController.refundPayment);

module.exports = router;

const PaymentService = require('../services/paymentServices');
const { formatPaymentResponse } = require('../responses/paymentResponse');
const asyncHandler = require('../utils/asyncHandler');

// --- Process a payment for a booking ---
exports.processPayment = asyncHandler(async (req, res) => {
    const { bookingId, amount, paymentMethod, currency } = req.body;
    
    const payment = await PaymentService.processPayment({
        bookingId,
        amount,
        paymentMethod,
        currency
    });

    res.status(201).json(formatPaymentResponse(payment, 'Payment processed successfully'));
});

// --- Get payment details by booking ID ---
exports.getPaymentByBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const payment = await PaymentService.fetchPaymentByBookingId(bookingId);

    res.status(200).json(formatPaymentResponse(payment, 'Payment retrieved successfully'));
});

// --- Refund a completed payment ---
exports.refundPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payment = await PaymentService.refundPayment(id);

    res.status(200).json(formatPaymentResponse(payment, 'Payment refunded successfully'));
});
/**
 * Formats raw Payment model documents into standardized API responses.
 */
const formatPaymentResponse = (payment, message = 'Operation successful') => {
    return {
        success: true,
        message,
        data: {
            id: payment._id,
            bookingId: payment.booking_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.payment_method,
            transactionRef: payment.transaction_ref,
            createdAt: payment.createdAt
        }
    };
};

module.exports = { formatPaymentResponse };
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { generateTransactionRef } = require('../utils/paymentUtils');
const { PaymentNotFoundError, PaymentFailedError } = require('../exceptions/paymentExceptions');

class PaymentService {
    static async processPayment({ bookingId, amount, paymentMethod, currency = 'EGP' }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const booking = await Booking.findById(bookingId).session(session);
            if (!booking) {
                throw new PaymentFailedError('Associated booking does not exist');
            }

            const transactionRef = generateTransactionRef('PAY');

            const payment = new Payment({
                booking_id: bookingId,
                amount,
                currency,
                payment_method: paymentMethod,
                status: 'completed',
                transaction_ref: transactionRef
            });

            await payment.save({ session });

            booking.status = 'confirmed';
            await booking.save({ session });

            await session.commitTransaction();
            session.endSession();

            return payment;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static async fetchPaymentByBookingId(bookingId) {
        const payment = await Payment.findOne({ booking_id: bookingId });
        if (!payment) {
            throw new PaymentNotFoundError('No payment record found for this booking');
        }
        return payment;
    }

    static async refundPayment(paymentId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const payment = await Payment.findById(paymentId).session(session);
            if (!payment) {
                throw new PaymentNotFoundError();
            }

            if (payment.status !== 'completed') {
                throw new PaymentFailedError('Only completed transactions can be refunded');
            }

            payment.status = 'refunded';
            await payment.save({ session });

            await Booking.findByIdAndUpdate(
                payment.booking_id,
                { status: 'cancelled' },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return payment;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = PaymentService;
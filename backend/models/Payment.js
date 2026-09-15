const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'EGP'
        },
        payment_method: {
            type: String,
            enum: ['credit_card', 'fawry', 'vodafone_cash', 'stripe'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transaction_ref: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
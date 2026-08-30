// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'EGP',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    provider: {
        type: String,
        enum: ['stripe', 'paymob', 'fawry', 'cash'],
        default: 'stripe'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'wallet', 'fawry_code', 'cash_at_counter'],
        default: 'card'
    },
    transactionId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true // يمنع التعارض عندما تكون العملية في حالة pending بدون transaction ID
    },
    failureReason: {
        type: String
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed // لحفظ تفاصيل الاستجابة القادمة من Stripe Webhook
    }
}, {
    timestamps: true // ينشئ تلقائياً حقول createdAt و updatedAt
});

module.exports = mongoose.model('Payment', paymentSchema);
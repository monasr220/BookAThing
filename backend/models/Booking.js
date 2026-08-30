// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie ID is required']
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: [true, 'Theater ID is required']
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: [true, 'Showtime ID is required']
    },
    seats: {
        type: [String],
        required: [true, 'At least one seat must be selected'],
        validate: [v => Array.isArray(v) && v.length > 0, 'Seats list cannot be empty']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: 0
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'refunded'],
        default: 'unpaid'
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment' // اختياري في البداية لأن الدفع يتم بعد إنشاء الحجز
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
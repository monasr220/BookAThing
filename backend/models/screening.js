const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
    theater_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Theater',
    },
    screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TheaterScreen',
    },
    movie_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'movies',
    },
    start_time: {
        type: Date,
        required: [true, 'Showtime start time is required'],
    },
    language: {
        type: String,
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled',
    },
}, { timestamps: true });

screeningSchema.index({ theater_id: 1, screen_id: 1, start_time: 1 });

const Screening = mongoose.model('movie_screening', screeningSchema);

module.exports = Screening;
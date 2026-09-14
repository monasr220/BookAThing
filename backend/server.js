require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const seatRoutes = require('./routes/seatRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const showTimeRoutes = require('./routes/showTimeRoutes');
const offerRoutes = require('./routes/offerRoutes');
const theaterDashboardRoutes = require('./routes/theaterDashboardRoutes');

const app = express();

// --- Core middleware ---
// The whole site is now one frontend app on a single origin (localhost:3000),
// but keep a small dev-only allow-list so things still work if you ever run
// a second frontend locally on a different port. Production strictly uses
// CLIENT_URLS (comma-separated) from .env — no implicit localhost fallback.
const devOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
];

const envOrigins = (process.env.CLIENT_URLS || process.env.CLINET_URL || process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? envOrigins
    : Array.from(new Set([...devOrigins, ...envOrigins]));

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser requests (curl, Postman, server-to-server) that send no Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showTimeRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/theaters', theaterDashboardRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// --- 404 handler ---
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// --- Centralized error handler ---
// Understands both AppError-style (statusCode) and the domain-specific
// exception classes (Seat/Review/Payment errors) that also carry statusCode.
app.use((err, req, res, next) => {
    console.error(err);

    // Mongoose throws a CastError (no .statusCode) when an ID doesn't look
    // like a valid ObjectId at all — e.g. an empty string or malformed value
    // reaching findById()/findOne() unvalidated. Without this, it would fall
    // through to the generic 500 below instead of a clear 400.
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: '${err.value}'`,
            errorCode: null,
            details: null
        });
    }

    // Mongoose schema validation errors (e.g. a required field missing on
    // .save()) also don't carry .statusCode by default.
    if (err.name === 'ValidationError' && err.errors) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errorCode: null,
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        errorCode: err.errorCode,
        details: err.details,
        unavailableSeats: err.unavailableSeats
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();

module.exports = app;

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const generalMax = Number(process.env.RATE_LIMIT_MAX) || 100;

// Rate limiter for sending OTPs.
// In production: max 3 requests per window. In development: much looser so
// local testing (e.g. running a Postman collection repeatedly) doesn't get blocked.
const otpRateLimiter = rateLimit({
    windowMs,
    max: isDev ? generalMax : 3,
    message: {
        message: 'Too many OTP requests from this IP. Please try again later.'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false // Disable `X-RateLimit-*` headers
});

// Strict limiter for login/reset attempts.
// In production: max 5 attempts per window. In development: much looser.
const authAttemptLimiter = rateLimit({
    windowMs,
    max: isDev ? generalMax : 5,
    message: {
        message: 'Too many failed authorization attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    otpRateLimiter,
    authAttemptLimiter
};

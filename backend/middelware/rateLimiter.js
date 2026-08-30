const rateLimit = require('express-rate-limit');

// Rate limiter for sending OTPs (Max 3 requests per 15 minutes per IP)
const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        message: 'Too many OTP requests from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false // Disable `X-RateLimit-*` headers
});

// Strict limiter for login/reset attempts (Max 5 attempts per 15 minutes)
const authAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many failed authorization attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    otpRateLimiter,
    authAttemptLimiter
};
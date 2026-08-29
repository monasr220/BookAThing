// backend/models/Otp.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Required if you hash OTPs (recommended)

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required for OTP.'],
        lowercase: true,
        trim: true,
        index: true, // Index for efficient lookup by email
    },
    otp: {
        type: String, // Store the hashed OTP
        required: [true, 'OTP value is required.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // MongoDB TTL index: Automatically deletes documents after 300 seconds (5 minutes)
        // This 'expires' option is sufficient to create the TTL index.
        expires: 300,
    },
});

otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
        next();
    } catch (error) {
        next(error);
    }
});


otpSchema.methods.compareOtp = async function (candidateOtp) {
    return await bcrypt.compare(candidateOtp, this.otp);
};


module.exports = mongoose.model('Otp', otpSchema);
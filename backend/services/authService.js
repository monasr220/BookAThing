const User = require('../models/User');
const { verifyOtp, createAndSendOtp } = require('./otpServices');
const { getCleanEmail, hashedPassword } = require('../utils/authHelpers');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const AuthError = require('../exceptions/AuthError');
const ValidationError = require('../exceptions/ValidationError');
const NotFoundError = require('../exceptions/NotFoundError');
const bcrypt = require('bcryptjs');

class AuthService {
    /**
     * Verifies the signup OTP, creates the user, and issues tokens.
     */
    static async completeSignUp({ name, email, password, phone, otp }) {
        const cleanEmail = getCleanEmail(email);
        if (!cleanEmail) {
            throw new ValidationError('A valid email is required.', 'email');
        }

        const otpResult = await verifyOtp(cleanEmail, otp);
        if (!otpResult.valid) {
            throw new ValidationError(otpResult.message, 'otp');
        }

        const existingUser = await User.findOne({ email: cleanEmail }).select('_id');
        if (existingUser) {
            throw new ValidationError('An account with this email already exists.', 'email');
        }

        const hashed = await hashedPassword(password);
        const user = await User.create({
            name,
            email: cleanEmail,
            password: hashed,
            phone
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { user, accessToken, refreshToken };
    }

    /**
     * Verifies credentials and issues fresh access/refresh tokens.
     * Uses a single generic error message to avoid leaking which part
     * of the credentials (email vs password) was wrong.
     */
    static async login({ email, password }) {
        const cleanEmail = getCleanEmail(email);
        if (!cleanEmail) {
            throw new AuthError('Invalid email or password.');
        }

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            throw new AuthError('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AuthError('Invalid email or password.');
        }

        if (user.status === 'inactive') {
            throw new AuthError('This account has been deactivated.');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { user, accessToken, refreshToken };
    }

    /**
     * Exchanges a valid refresh token for a new access/refresh token pair.
     * Refresh tokens are rotated on every use; tokenVersion allows all
     * outstanding refresh tokens to be invalidated at once (see logout()).
     */
    static async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new AuthError('Refresh token is required.');
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new AuthError('Invalid or expired refresh token.');
        }

        const user = await User.findById(decoded.userId);
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            throw new AuthError('Invalid or expired refresh token.');
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    /**
     * Invalidates all refresh tokens previously issued to this user.
     */
    static async logout(userId) {
        await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    }

    /**
     * Sends a password-reset OTP. Always resolves successfully regardless
     * of whether the email is registered, to avoid leaking account existence.
     * Returns the OTP itself only outside production (for local/dev testing).
     */
    static async forgotPassword(email) {
        const cleanEmail = getCleanEmail(email);
        if (!cleanEmail) return null;

        const user = await User.findOne({ email: cleanEmail }).select('_id');
        if (!user) return null;

        const { devOtp } = await createAndSendOtp({
            email: cleanEmail,
            subject: 'Reset Your Password',
            title: 'Password Reset Request'
        });

        return devOtp;
    }

    /**
     * Verifies the reset OTP, sets the new password, and invalidates
     * any refresh tokens issued before the reset.
     */
    static async resetPassword({ email, otp, newPassword }) {
        const cleanEmail = getCleanEmail(email);
        if (!cleanEmail) {
            throw new ValidationError('A valid email is required.', 'email');
        }

        const otpResult = await verifyOtp(cleanEmail, otp);
        if (!otpResult.valid) {
            throw new ValidationError(otpResult.message, 'otp');
        }

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            throw new NotFoundError('User');
        }

        user.password = await hashedPassword(newPassword);
        user.tokenVersion += 1;
        await user.save();
    }
}

module.exports = AuthService;

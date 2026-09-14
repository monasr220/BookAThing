const { getCleanEmail, hashedPassword } = require('../utils/authHelpers');
const { verifyOtp, createAndSendOtp } = require('../services/otpServices');
const AuthService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const SuccessResponse = require('../responses/SuccessResponse');
const CreateResponse = require('../responses/CreateResponse');

exports.sendSignUpOtp = asyncHandler(async (req, res) => {
    // Clean and validate the email
    const lowerCaseEmail = getCleanEmail(req.body.email);
    if (!lowerCaseEmail) {
        return res.status(400).json({ message: 'Valid email is required.' });
    }

    const { success, devOtp } = await createAndSendOtp({
        email: lowerCaseEmail,
        subject: 'Verify Your Account',
        title: 'Welcome!'
    });

    if (!success) {
        return res.status(500).json({ message: 'Failed to send OTP.' });
    }

    // devOtp is only ever set outside production (see otpServices.js) — this
    // never leaks a real OTP over the wire in production.
    return res.status(200).json({
        message: 'OTP sent successfully.',
        ...(devOtp ? { devOtp } : {})
    });
});

// --- Verify signup OTP, create the user, and issue tokens ---
exports.completeSignUp = asyncHandler(async (req, res) => {
    const { name, email, password, phone, otp } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.completeSignUp({ name, email, password, phone, otp });

    new CreateResponse({ user, accessToken, refreshToken }, 'Account created successfully.').send(res);
});

// --- Verify credentials and issue tokens ---
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login({ email, password });

    new SuccessResponse({ user, accessToken, refreshToken }, 'Logged in successfully.').send(res);
});

// --- Exchange a refresh token for a new access/refresh token pair ---
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshAccessToken(refreshToken);

    new SuccessResponse(tokens, 'Token refreshed successfully.').send(res);
});

// --- Invalidate all of the authenticated user's refresh tokens ---
exports.logout = asyncHandler(async (req, res) => {
    await AuthService.logout(req.user.userId);
    new SuccessResponse(null, 'Logged out successfully.').send(res);
});

// --- Send a password-reset OTP (always responds success to avoid leaking account existence) ---
exports.forgotPassword = asyncHandler(async (req, res) => {
    const devOtp = await AuthService.forgotPassword(req.body.email);
    new SuccessResponse(
        devOtp ? { devOtp } : null,
        'If an account with that email exists, a reset code has been sent.'
    ).send(res);
});

// --- Verify reset OTP and set a new password ---
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword({ email, otp, newPassword });

    new SuccessResponse(null, 'Password has been reset successfully.').send(res);
});

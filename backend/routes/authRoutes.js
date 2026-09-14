const express = require('express');
const router = express.Router();

const authController = require('../controllers/auhtController');
const {
    sendOtpRules,
    completeSignUpRules,
    loginRules,
    forgotPasswordRules,
    resetPasswordRules,
    refreshTokenRules
} = require('../middelware/authValidation');
const { otpRateLimiter, authAttemptLimiter } = require('../middelware/rateLimiter');
const { authenticateJWT } = require('../middelware/AuthMiddleWare');

router.post('/send-signup-otp', otpRateLimiter, sendOtpRules, authController.sendSignUpOtp);

router.post('/complete-signup', completeSignUpRules, authController.completeSignUp);

router.post('/login', authAttemptLimiter, loginRules, authController.login);

router.post('/refresh-token', refreshTokenRules, authController.refreshToken);

router.post('/logout', authenticateJWT, authController.logout);

router.post('/forgot-password', otpRateLimiter, forgotPasswordRules, authController.forgotPassword);

router.post('/reset-password', authAttemptLimiter, resetPasswordRules, authController.resetPassword);

module.exports = router;

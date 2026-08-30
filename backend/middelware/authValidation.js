const { body, validationResult } = require('express-validator');

// Reusable middleware to intercept and return validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed.',
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// --- Validation Rules ---

exports.sendOtpRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    validate
];

exports.completeSignUpRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required.'),
    body('otp')
        .isLength({ min: 4, max: 4 }).withMessage('OTP must be exactly 4 digits.')
        .isNumeric().withMessage('OTP must contain numbers only.'),
    validate
];

exports.loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.'),
    validate
];

exports.forgotPasswordRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    validate
];

exports.resetPasswordRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('otp')
        .isLength({ min: 4, max: 4 }).withMessage('OTP must be exactly 4 digits.')
        .isNumeric().withMessage('OTP must contain numbers only.'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.'),
    body('confirmPassword')
        .optional()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    validate
];
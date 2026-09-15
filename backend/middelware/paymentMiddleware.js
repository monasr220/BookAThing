const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

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

const validatePaymentParams = (req, res, next) => {
    const idFields = ['id', 'bookingId'];
    for (const field of idFields) {
        const value = req.params[field];
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({ message: `Invalid ${field} format` });
        }
    }
    next();
};

const processPaymentRules = [
    body('bookingId')
        .notEmpty().withMessage('bookingId is required.')
        .isMongoId().withMessage('bookingId must be a valid ID.'),
    body('amount')
        .isFloat({ gt: 0 }).withMessage('amount must be a positive number.'),
    body('paymentMethod')
        .isIn(['credit_card', 'fawry', 'vodafone_cash', 'stripe']).withMessage('Invalid paymentMethod.'),
    body('currency').optional().isString(),
    validate
];

module.exports = {
    validatePaymentParams,
    processPaymentRules
};

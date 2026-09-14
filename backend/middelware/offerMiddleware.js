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

const validateOfferId = (req, res, next) => {
    const { id } = req.params;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Offer ID format' });
    }
    next();
};

const createOfferRules = [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('type').isIn(['conditional', 'promocode']).withMessage('type must be "conditional" or "promocode".'),
    body('code')
        .if(body('type').equals('promocode'))
        .trim().notEmpty().withMessage('code is required when type is "promocode".'),
    body('scope').optional().isIn(['all', 'movie', 'first_time']).withMessage('Invalid scope.'),
    body('movieId')
        .if(body('scope').equals('movie'))
        .isMongoId().withMessage('A valid movieId is required when scope is "movie".'),
    body('discountType').isIn(['percentage', 'flat']).withMessage('discountType must be "percentage" or "flat".'),
    body('discountValue').isFloat({ min: 0 }).withMessage('discountValue must be a non-negative number.'),
    body('startsAt').optional().isISO8601().withMessage('startsAt must be a valid date.'),
    body('endAt').optional().isISO8601().withMessage('endAt must be a valid date.'),
    validate
];

const updateOfferRules = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('discountType').optional().isIn(['percentage', 'flat']).withMessage('discountType must be "percentage" or "flat".'),
    body('discountValue').optional().isFloat({ min: 0 }).withMessage('discountValue must be a non-negative number.'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
    body('startsAt').optional().isISO8601().withMessage('startsAt must be a valid date.'),
    body('endAt').optional().isISO8601().withMessage('endAt must be a valid date.'),
    validate
];

module.exports = {
    validateOfferId,
    createOfferRules,
    updateOfferRules
};

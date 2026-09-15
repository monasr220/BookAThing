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

const validateShowtimeParams = (req, res, next) => {
    const idFields = ['id', 'movieId', 'theaterId', 'screenId'];
    for (const field of idFields) {
        const value = req.params[field];
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({ message: `Invalid ${field} format` });
        }
    }
    next();
};

const createShowtimeRules = [
    body('movieId').isMongoId().withMessage('A valid movieId is required.'),
    body('theaterId').isMongoId().withMessage('A valid theaterId is required.'),
    body('screenId').isMongoId().withMessage('A valid screenId is required.'),
    body('startTime')
        .notEmpty().withMessage('startTime is required.')
        .isISO8601().withMessage('startTime must be a valid date.')
        .custom(value => new Date(value) > new Date()).withMessage('startTime must be in the future.'),
    body('language').optional().trim(),
    validate
];

const updateShowtimeRules = [
    body('startTime').optional().isISO8601().withMessage('startTime must be a valid date.'),
    body('language').optional().trim(),
    validate
];

module.exports = {
    validateShowtimeParams,
    createShowtimeRules,
    updateShowtimeRules
};

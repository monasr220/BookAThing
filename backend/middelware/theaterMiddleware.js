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

const validateTheaterId = (req, res, next) => {
    const { theaterId } = req.params;
    if (theaterId && !mongoose.Types.ObjectId.isValid(theaterId)) {
        return res.status(400).json({ message: 'Invalid Theater ID format' });
    }
    next();
};

const validateScreenId = (req, res, next) => {
    const { screenId } = req.params;
    if (screenId && !mongoose.Types.ObjectId.isValid(screenId)) {
        return res.status(400).json({ message: 'Invalid Screen ID format' });
    }
    next();
};

const createTheaterRules = [
    body('name').trim().notEmpty().withMessage('Theater name is required.'),
    body('location.address').trim().notEmpty().withMessage('Address is required.'),
    body('location.city').trim().notEmpty().withMessage('City is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array.'),
    validate
];

const updateTheaterRules = [
    body('name').optional().trim().notEmpty().withMessage('Theater name cannot be empty.'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array.'),
    validate
];

const createScreenRules = [
    body('screenName').trim().notEmpty().withMessage('Screen name is required.'),
    body('screenType').optional().isIn(['2D', '3D', 'IMAX', '4DX']).withMessage('Invalid screen type.'),
    body('totalRows').isInt({ min: 1 }).withMessage('totalRows must be a positive integer.'),
    body('seatsPerRow').isInt({ min: 1 }).withMessage('seatsPerRow must be a positive integer.'),
    validate
];

module.exports = {
    validateTheaterId,
    validateScreenId,
    createTheaterRules,
    updateTheaterRules,
    createScreenRules
};

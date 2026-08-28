const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Theater = require('../models/theater');

exports.authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
        }

        req.user = {
            userId: user._id,
            role: user.role,
            email: user.email,
            name: user.name
        };

        if (user.role === 'theater_admin') {
            const theater = await Theater.findOne({ user_id: user._id }).select('_id').lean();
            if (!theater) {
                return res.status(403).json({ 
                    message: 'Theater admin account is not properly configured. Please contact support.' 
                });
            }
            req.user.theater_id = theater._id;
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }

        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

exports.authorizeTheatreAdmin = async (req, res, next) => {
    if (!req.user?.role) {
        return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    }

    if (req.user.role !== 'theater_admin') {
        return res.status(403).json({ message: 'Forbidden: Theatre Admin role required.' });
    }

    const { theaterId } = req.params;
    
    if (!theaterId) return next();

    if (!mongoose.Types.ObjectId.isValid(theaterId) || !mongoose.Types.ObjectId.isValid(req.user.userId)) {
        return res.status(400).json({ message: 'Invalid Theater ID or User ID format.' });
    }

    try {
        const theater = await Theater.findOne({
            _id: theaterId,
            user_id: req.user.userId
        }).select('_id').lean();

        if (!theater) {
            return res.status(403).json({ message: 'Forbidden: Not authorized for this specific theater.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error during authorization check.' });
    }
};

exports.authorizeAdmin = (req, res, next) => {
    if (!req.user?.role) {
        return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin role required.' });
    }

    next();
};

exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Role '${req.user.role}' is not authorized for this resource.`
            });
        }

        next();
    };
};
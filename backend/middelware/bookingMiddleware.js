const mongoose = require('mongoose');

exports.validateCreateBooking = (req,res,next)=>{
    const {showtimeId , seatId} = req.body;
    const userId = req.user?.userId||req.user?._id;

    if(!userId){
        return res.status(401).json({message:'User not authenticated. Please log in.'});
    }
    if(!showtimeId || !mongoose.Types.ObjectId.isValid(showtimeId)){
        return res.status(400).json({message:'invalid or missing Show time ID format '});
    }
    if (!seatId||!Array(seatId)||seatId.length===0){
        return res.status(400).json({message:'Seat IDs must be provided as  a non empty array'});}

    if (!seatIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: 'One or more Seat IDs are invalid.' });
    }

    next();
};

exports.validateCancelBooking = (req, res, next) => {
    const { bookingId } = req.params;
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    next();
};
exports.validateVerifyTicket = (req, res, next) => {
    const { bookingId, showtimeId } = req.body;
    const verifierUserId = req.user?.userId || req.user?._id;
    const verifierTheaterId = req.user?.theater_id?.toString();

    if (!verifierUserId) {
        return res.status(401).json({ message: 'Verifier not authenticated.' });
    }
    if (!verifierTheaterId) {
        return res.status(403).json({ message: 'User not authorized to verify tickets (missing theater association).' });
    }
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }
    if (!showtimeId || !mongoose.Types.ObjectId.isValid(showtimeId)) {
        return res.status(400).json({ message: 'Invalid Showtime ID format.' });
    }

    next();
};
const sendEmail = require('./emailService');


exports.evaluateBestOffer = async(subtotla,userId,showtimeId)=>{

    return {
        discountAmount : 0,
        appliedOfferId:null
    };
};

// check if the time of cancelling is overdue or not
exports.isCancellationAllowed = (showtimeStartTime , cutoffHours = 2)=>{
    const showtimeDate = new Date(showtimeStartTime);
    const currentDate = new Date();
    const cutoffMillis = cutoffHours * 60 * 60 *100;

    return (showtimeDate.getTime() - currentDate.getTime() ) > cutoffHours;
}  

exports.sendCancellationEmail = async (bookingData) => {
    const { user, movie, theater, screen, showtime, updatedBooking } = bookingData;
    const seatNumbersString = updatedBooking.booked_seats?.map(s => s.seat_number).join(', ') || 'N/A';

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #4a4a4a;">Cineplus Booking Cancellation Confirmation</h1>
            <p>Hi ${user.name || 'Valued Customer'},</p>
            <p>This email confirms that your Cineplus booking has been successfully cancelled.</p>
            <div style="border: 1px solid #eee; padding: 15px; background-color: #f9f9f9;">
                <p><strong>Booking ID:</strong> ${updatedBooking._id}</p>
                <p><strong>Movie:</strong> ${movie.title}</p>
                <p><strong>Theater:</strong> ${theater.name} (${theater.city})</p>
                <p><strong>Screen:</strong> ${screen.screen_number}</p>
                <p><strong>Seats:</strong> ${seatNumbersString}</p>
                <p><strong>Payment Status:</strong> ${updatedBooking.payment_status}</p>
            </div>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: `❌ Cineplus Booking Cancelled: ${movie.title}`,
        html: emailHtml,
        message: `Booking ${updatedBooking._id} cancelled.`
    });
};
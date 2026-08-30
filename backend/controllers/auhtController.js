const { getCleanEmail, hashedPassword } = require('../utils/authHelpers');
const { verifyOtp, createAndSendOtp } = require('../services/otpService');

exports.sendSignUpOtp = async (req, res) => {
    try {
        // استخدام دالة تنظيف الإيميل[cite: 9]
        const lowerCaseEmail = getCleanEmail(req.body.email);     if (!lowerCaseEmail) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        const sent = await createAndSendOtp({
            email: lowerCaseEmail,
            subject: 'Verify Your Account',
            title: 'Welcome!'
        });

        if (!sent) {
            return res.status(500).json({ message: 'Failed to send OTP.' });
        }

        return res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
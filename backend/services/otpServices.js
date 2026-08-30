const crypto = require('crypto');
const Otp = require('../models/otp');
const sendEmail = require('../utils/emailService');
const { getCleanEmail } = require('../middlewares/emailMiddleWare');

const verifyOtp = async (email, inputOtp) => {
    const lowerCaseEmail = getCleanEmail(email);

    if (!lowerCaseEmail) {
        return { valid: false, message: 'Valid email is required.' };
    }

    if (!inputOtp) {
        return { valid: false, message: 'OTP code is required.' };
    }

    const otpRecord = await Otp.findOne({ email: lowerCaseEmail });
    if (!otpRecord) {
        return { valid: false, message: 'OTP not found or expired.' };
    }

    const isMatch = await otpRecord.compareOtp(inputOtp.toString());
    if (!isMatch) {
        return { valid: false, message: 'Invalid OTP code.' };
    }

    // OTP is valid -> consume it immediately
    await Otp.deleteOne({ _id: otpRecord._id });

    return { valid: true, message: 'OTP verified successfully.' };
};

const createAndSendOtp = async ({ email, subject, title }) => {
    try {
        const otp = crypto.randomInt(1000, 10000).toString();

        await Otp.deleteOne({ email });
        await Otp.create({ email, otp });

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #f9f9f9; border-radius: 12px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
                <p style="color: #555; font-size: 16px;">Use the following 4-digit code to complete your request.</p>
                <p style="color: #777; font-size: 14px;">This code expires in 5 minutes.</p>
                <div style="margin: 25px 0; padding: 15px; background-color: white; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; color: #e63946; letter-spacing: 8px;">${otp}</span>
                </div>
                <p style="color: #999; font-size: 12px;">If you did not request this code, you can safely ignore this email.</p>
            </div>
        `;

        await sendEmail({
            email,
            subject,
            message: `Your OTP code is: ${otp}`,
            html: emailHtml
        });

        return true;
    } catch (error) {
        console.error('Create and Send OTP Error:', error);
        await Otp.deleteOne({ email });
        return false;
    }
};

module.exports = {
    verifyOtp,
    createAndSendOtp
};
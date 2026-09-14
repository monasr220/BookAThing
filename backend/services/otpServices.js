const crypto = require('crypto');
const Otp = require('../models/otp');
const sendEmail = require('../utils/emailService');
const { getCleanEmail } = require('../utils/authHelpers');

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
    const otp = crypto.randomInt(1000, 10000).toString();

    try {
        await Otp.deleteOne({ email });
        await Otp.create({ email, otp });
    } catch (error) {
        console.error('Create OTP Error:', error);
        return false;
    }

    // In development, print the OTP to the server console so testing (e.g. via
    // Postman) doesn't depend on real email credentials being configured.
    if (process.env.NODE_ENV !== 'production') {
        console.log(`\n[DEV ONLY] OTP for ${email}: ${otp}\n`);
    }

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

    // devOtp is only ever populated outside production — see callers, which
    // must never forward it to a client in production.
    const devOtp = process.env.NODE_ENV !== 'production' ? otp : null;

    try {
        await sendEmail({
            email,
            subject,
            message: `Your OTP code is: ${otp}`,
            html: emailHtml
        });
        return { success: true, devOtp };
    } catch (error) {
        console.error('Send OTP Email Error:', error.message);
        // In development, don't fail the request just because email sending
        // isn't configured yet — the OTP was already logged above and saved to
        // the database, so the flow can still be tested end-to-end.
        return { success: process.env.NODE_ENV !== 'production' ? true : false, devOtp };
    }
};

module.exports = {
    verifyOtp,
    createAndSendOtp
};
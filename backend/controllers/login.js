import User from '../models/User';
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 1. تجهيز الـ Payload وتضمين tokenVersion
        const payload = {
            userId: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion || 0
        };

        // 2. إنشاء الـ Token باستخدام المفتاح المحدد
        const token = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 3. إرسال الاستجابة مرة واحدة فقط في النهاية
        return res.status(200).json({
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Login Failed:', error);
        return res.status(500).json({ message: 'Internal server error during login' });
    }
};
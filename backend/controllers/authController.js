import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


exports.signUp = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "all fields are required"
      });
      
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "password must be at least 8 characters long"
      });
      
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({message:"Email is already register"})
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user'
    });
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User register successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status
      }
    });
  }
  catch (error) {
    console.error('Sign up Error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
  exports.signOut = async (req, res)=>{
    try {
        res.status(200)
      }
  }
}
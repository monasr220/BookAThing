const User = require("../models/User");
const bcrypt= require("bcrypt");
const jwt = require('jsonwebtoken');


exports.login = async (req,res)=>{
    try{
        const {email , password} = req.body;


        if(!email||!password){
            return res.status(400).json({message:'Please provide email and password'});
        }
        const user = await User.findOne({email});

        if(!user){
            return res.status(4001).json({message:'invalid email or password'});
        }

        if (user.status==='inactive'){
            return res.status(403).json({message:"your account is inactive. please content support"})
        }

        const isMatch = await bcrypt.compare(password,user.password);
    
        if(!isMatch){
            return res.status(401).json({message:'invlaid email or password'});
        }
        // create Token to for userId

        const payload={
            userId:user._id,
            role:user.role
        };

        // depend on AuthMiddleware.js for JWT_ACCESS_SECRET

        const token = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn:'7d'
            }
        );

    //send res
    res.status(200).json({
        message:"Login Successfully",
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            status:user.status
        }
    });
    }
    catch(error){
        console.error('Login Failde',error);
        res.status(500).json({message:'Internal server error during login'});
        

    }
}
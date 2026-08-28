const jwt = require('jsonwebtoken')
const User = require('../models/User');
const verifyToken = async (req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({message:'No Token provided'});
        }

        const decode = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decode.id).select('-password');

        if (!user){
            return res.status(401).json({message:"User not found"});
        }

        req.user = user;
        next();
    }
    catch (error){
        console.error('Token verificatioin error:',error);
        return res.status(401).json({message:'Invalid token'});
        
    }
};

const isTheaterAdmin = (req , res , next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }
    else{
        res.status(403).json({message:'Access denied. Theater Admin Only'});
    }
};

const isAdmin = (req , res, next)=> {
    if(req.user && req.user.role==='admin' || req.user.role==='admin'){
        next();
    }
    else{
        req.status(403).json({message:'Access denied,Admin only'});
    }

};

module.exports={
    verifyToken,
    isAdmin,
    isTheaterAdmin
}
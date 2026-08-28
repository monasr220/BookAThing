import mongoose from "mongoose";

const loginSchema= new mongoose.Schema({
    email : {
        type:String,
        required:[true, "email is required"],
        unique: true,
        lowercase:true,
        trim : true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "please enter the email correctly"]
    },
    password: {
        type:String,
        required:[true , "password is required"],
        minLength:[8 , "password must be more than 8"]
    },
    userType:{
        type:String,
        enum:["user","admin","owner"],
        default:"user",
        required:true
    },
    status:{
        type:String,
        enum:["active","inactive","blocked"],
        default:"active",
        required:true
    }
},
 {timestamps: true});

module.exports= mongoose.model('Login',loginSchema)
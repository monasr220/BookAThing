import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , "name is required"],
        trim : true
    },
    email :{
        type:String,
        required:[true , "email is required"],
        unique : true,
        lowercase : true,
        trim :true
    },
    password :{
        type:String,
        required:true,
        minLength:[8 , "Password must be at least 8 characters long"],

    },
    phone:{
        type:String,
        required:[true , "Phone is required"],
        trim : true
    },
    role :{
        type:String,
        enum:["user", "admin" , "owner"],
        default:"user",
    },
    status:{
        type:String,
        enum:["active" , "inactive"],
        default:"active",
    },
    favorites:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Movie"
        },
  ],
  tokenVersion: {
    type: Number,
    default:0
  },
    bookingHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Booking"
        },

    ],

}, 
    {timestamps:true}

 )
;

module.exports=mongoose.model("User",userSchema)
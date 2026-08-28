import mongoose from "mongoose";

const couponSchema=new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    description:{
        type:String,
        default:"",
    },
    discountType:{
        type:String,
        enum:["FIXES","PERCENTAGE"],
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minBookingAmount:{
        type:Number,
        default:0,
    },
    isActive:{
        type:Boolean,
        default:true
    },

},
{timestamps:true});

module.exports=mongoose.model("Coupon",couponSchema)
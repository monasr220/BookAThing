import mongoose, { model } from "mongoose";

const bookingSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    showId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"show",
        required:true
    },
    seats:[String],

    snacks:[{
        name:String,
        price:Number,
        quantity:Number
}],

    parking:{
        type:String,
        price:Number,
        theater:String
    },
    totalPrice:{
        type:Number,
        default:0,

    },
    paymentStatus:{
        type:String,
        enum:["Success",
            "Failed",
            "Pending"
        ],
        default:"Success"
    },
    status:{
        type:String,
        enum:["VALID","USED","COMPLETED"],
        default:"VALID",
    },

},
{timestamps:true});

module.exports=mongoose.model("Booking",bookingSchema)


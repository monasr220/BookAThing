import mongoose from "mongoose";

const bookingSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    movieId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"movies",
    },
    theaterId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'theater'
    },
    showtimeId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"showtime"
    },
    selectedSeats:{
        type:[String], //to easily handel multiple seats
        required:true
    },
    bookingDate:{
        type:Date,
        required:true,
        default : Date.now
    },
    bookingStatus:{
        type:String,
        enum:["pending" , "confirmed" ,"cancelled"],
        default:"pending",
        required:true,

    },
    amount:{
        type:Number,
        required:true
    },
    paymentId:{
        type:String,
        required:true
    }
    //payment model

},
    {timestamps:true},
);

module.exports=mongoose.model('Booking',bookingSchema)


import mongoose from "mongoose";

const parkingSchema=new mongoose.Schema({
    theater:{
        type:String,
        required:true
    },
    bikeSlots:Number,
    carSlots:Number,
    priceBike:Number,
    priceCar:Number,
},
{timestamps:true})

module.exports=mongoose.model("Parking",parkingSchema)
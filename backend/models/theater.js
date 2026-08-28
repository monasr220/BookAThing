import mongoose, { mongo } from "mongoose";

const theaterSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Theater name is required"],
        trim :true
    },
    location:{
        address:{
            type:String,
            required:[true,"Address is required"],
        },
        city:{
            type:String,
            required:[true,"City is required"],
        },
        state:String,
        zipCode:String
    },
    phone:{
        type:String,
        required:[true,"Phone is required"],

    },
    amenities:[String],
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

},
{timestamps:true}
);

module.exports=mongoose.model("Theater",theaterSchema)
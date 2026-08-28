import mongoose from "mongoose";

const movieSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    poster:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        default:""
    },

},
{timestamps:true});

module.exports=mongoose.model("Movie",movieSchema)
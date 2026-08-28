import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,

    },
    StreamingType:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    releaseDate:{
        type:Date,
        required:true
    },
    language:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: true,
    },
    director: {
        type: String,
        required: true,
    },
    production: {
        type: String,
        required: true,
    },
    cast: {
        type: String,
        required: true,
    },
    poster_url: {
        type: String,
        required: true,
    },
    trailer_url: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('movies', movieSchema);

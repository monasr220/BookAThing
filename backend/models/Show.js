import mongoose from "mongoose";

const seatSchema=new mongoose.Schema({
    seatNumber:{
    type:Number,
    required:true,
    },
    
    category:{
        type:String,
        enum:["Balacony","First class","Second Class"],
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    isBooked:{
        type:Boolean,
        default:true
    },

});

//this was seat Schema

//now this is show schema

const showSchema=new mongoose.Schema({
    movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },

  
  theatre: {
    type: String,
    required: true
  },

  /* Show Date + Time */
  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },

  
  balconyPrice: {
    type: Number,
    required: true
  },

  firstClassPrice: {
    type: Number,
    required: true
  },

  secondClassPrice: {
    type: Number,
    required: true
  },

  /* Seat List */
  seats: [seatSchema]

},
{ timestamps: true });


module.exports = mongoose.model("Show", showSchema);

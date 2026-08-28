const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String, // e.g., "A1", "B5"
    required: true,
  },
  seatType: {
    type: String,
    enum: ["standard", "vip", "recliner"],
    default: "standard",
  },
  priceMultiplier: {
    type: Number,
    default: 1.0, // Used to adjust base price (e.g., 1.5 for VIP)
  },
});

const theaterScreenSchema = new mongoose.Schema(
  {
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater", 
      required: [true, "Theater ID is required"],
    },
    screenName: {
      type: String, 
      required: [true, "Screen name is required"],
      trim: true,
    },
    screenType: {
      type: String,
      enum: ["2D", "3D", "IMAX", "4DX"],
      default: "2D",
    },
    capacity: {
      type: Number,
      required: [true, "Screen capacity is required"],
    },
    totalRows: {
      type: Number,
      required: [true, "Total rows count is required"],
    },
    seatsPerRow: {
      type: Number,
      required: [true, "Seats per row count is required"],
    },
    seats: [seatSchema], 
  },
  { timestamps: true }
);

theaterScreenSchema.index({ theaterId: 1, screenName: 1 }, { unique: true });

const TheaterScreen = mongoose.model("TheaterScreen", theaterScreenSchema);

module.exports = TheaterScreen;
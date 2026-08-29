const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true,'Offer title is requried'],
    trim: true
  },
  type: {
    type: String,
    enum: ['conditional', 'promocode'],
    required: true
  },
  code: {
    type: String,
    uppercase: true,
    trim: true,
    sparse:true //to prevent duplecates
  },
  condition: {
    type: Object,
    requied: function () {
      return this.type==='conditional'
    }
  },
  scope: {
    type: String,
    enum: ["all", 'movie', 'first_time'],
    default: "all",
    
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: function() {
          return this.scope === 'movie';
        }
  },
  discountType: {
    type: String,
    enum: ['precentage', 'flat'],
    required: true,
    
  },
  isActive: {
    type: Boolean,
    default:true
  },
  startsAt: {
    type: Date,
      default:Date.now()
  },
  endAt: { type: Date },
},
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema)

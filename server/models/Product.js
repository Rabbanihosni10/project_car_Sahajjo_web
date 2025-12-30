const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['parts', 'tools', 'accessories', 'fluids', 'electronics', 'other'],
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  images: [String],
  stock: {
    type: Number,
    default: 0,
  },
  brand: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);

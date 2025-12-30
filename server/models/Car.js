const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  mileage: {
    type: Number,
    default: 0,
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol',
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual',
  },
  color: String,
  images: [String],
  description: String,
  status: {
    type: String,
    enum: ['available', 'rented', 'sold', 'maintenance'],
    default: 'available',
  },
  isForSale: {
    type: Boolean,
    default: false,
  },
  isForRent: {
    type: Boolean,
    default: false,
  },
  rentalRates: {
    hourly: Number,
    daily: Number,
  },
  documents: {
    rc: {
      number: String,
      photo: String,
      expiryDate: Date,
    },
    insurance: {
      number: String,
      photo: String,
      expiryDate: Date,
    },
    pollution: {
      number: String,
      photo: String,
      expiryDate: Date,
    },
  },
  specifications: {
    seats: Number,
    engineCC: Number,
    features: [String],
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

module.exports = mongoose.model('Car', carSchema);

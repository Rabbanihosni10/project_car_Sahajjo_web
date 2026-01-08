const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    services: [{
      type: String,
      trim: true,
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    images: [{
      type: String,
    }],
    website: {
      type: String,
    },
    email: {
      type: String,
    },
    openingHours: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
garageSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Index for status and verification
garageSchema.index({ status: 1, isVerified: 1 });

module.exports = mongoose.model('Garage', garageSchema);

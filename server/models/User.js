const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['owner', 'driver', 'admin'],
    default: 'owner',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  photo: {
    type: String,
    default: '',
  },
  licenseInfo: {
    licenseNumber: String,
    expiryDate: Date,
    licensePhoto: String,
  },
  kycDocuments: {
    idType: String,
    idNumber: String,
    idPhoto: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  location: {
    latitude: {
      type: Number,
      default: 23.8103,
    },
    longitude: {
      type: Number,
      default: 90.4125,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorCode: String,
  twoFactorExpires: Date,
  lastOtpSentAt: Date,
  otpAttemptCount: {
    type: Number,
    default: 0,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

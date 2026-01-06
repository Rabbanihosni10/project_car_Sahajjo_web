const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['booking', 'job', 'payment', 'message', 'document', 'order', 'general'],
    default: 'general',
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  relatedType: {
    type: String,
    enum: ['booking', 'job', 'order', 'message', 'document'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);

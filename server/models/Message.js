const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  attachments: [String],
  conversationId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create conversation ID from two user IDs
messageSchema.statics.createConversationId = function(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);

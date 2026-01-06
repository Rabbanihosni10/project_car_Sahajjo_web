const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, attachments } = req.body;
    
    const conversationId = Message.createConversationId(req.user.id, receiver);

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
      attachments,
      conversationId,
    });

    await message.populate('sender receiver', 'name photo');

    // Emit socket event
    if (req.io) {
      req.io.to(receiver).emit('new-message', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.createConversationId(req.user.id, userId);

    const messages = await Message.find({ conversationId })
      .populate('sender receiver', 'name photo')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getMyConversations = async (req, res) => {
  try {
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate('sender receiver', 'name photo')
      .sort({ createdAt: -1 });

    // Group by conversation and get latest message for each
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const conversationId = msg.conversationId;
      if (!conversationsMap.has(conversationId)) {
        const otherUser =
          msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
        conversationsMap.set(conversationId, {
          conversationId,
          otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (!msg.isRead && msg.receiver._id.toString() === req.user.id) {
        conversationsMap.get(conversationId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/conversation/:userId/read
// @access  Private
exports.markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.createConversationId(req.user.id, userId);

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user.id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false,
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

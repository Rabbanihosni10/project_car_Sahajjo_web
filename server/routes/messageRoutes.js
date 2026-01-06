const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getMyConversations,
  markConversationAsRead,
  deleteMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getMyConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/conversation/:userId', protect, getConversation);
router.put('/conversation/:userId/read', protect, markConversationAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;

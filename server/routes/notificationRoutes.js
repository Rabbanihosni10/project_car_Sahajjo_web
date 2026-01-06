const express = require('express');
const router = express.Router();
const {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('admin'), createNotification);
router.get('/', protect, getMyNotifications);
router.get('/unread/count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;

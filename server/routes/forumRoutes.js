const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  addComment,
  deletePost,
  getMyPosts,
} = require('../controllers/forumController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, createPost);
router.get('/', getAllPosts);
router.get('/my/posts', protect, getMyPosts);

// Admin moderation routes - MUST come before /:id routes
router.get('/pending', protect, authorize('admin'), require('../controllers/forumController').getPendingPosts);
router.get('/rejected', protect, authorize('admin'), require('../controllers/forumController').getRejectedPosts);
router.put('/:id/approve', protect, authorize('admin'), require('../controllers/forumController').approvePost);
router.put('/:id/reject', protect, authorize('admin'), require('../controllers/forumController').rejectPost);
router.put('/:id/restore', protect, authorize('admin'), require('../controllers/forumController').restorePost);

// Dynamic routes with :id parameter
router.get('/:id', getPostById);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;

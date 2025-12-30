const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  addComment,
  deletePost,
} = require('../controllers/forumController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;

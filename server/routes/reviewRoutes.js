const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByTarget,
  getAllReviews,
  updateReview,
  deleteReview,
  moderateReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, createReview);
router.get('/', protect, authorize('admin'), getAllReviews);
router.get('/:targetType/:targetId', getReviewsByTarget);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/moderate', protect, authorize('admin'), moderateReview);

module.exports = router;

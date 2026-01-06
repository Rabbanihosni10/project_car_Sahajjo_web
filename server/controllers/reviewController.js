const Review = require('../models/Review');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    // Check if user already reviewed this target
    const existingReview = await Review.findOne({
      user: req.user.id,
      targetType,
      targetId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this' });
    }

    const review = await Review.create({
      user: req.user.id,
      targetType,
      targetId,
      rating,
      comment,
      isVerified: true, // Verified if from authenticated user
    });

    await review.populate('user', 'name photo');

    // Update average rating
    await updateAverageRating(targetType, targetId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by target
// @route   GET /api/reviews/:targetType/:targetId
// @access  Public
exports.getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.find({
      targetType,
      targetId,
      isModerated: true,
    })
      .populate('user', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update average rating
    await updateAverageRating(review.targetType, review.targetId);

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { targetType, targetId } = review;
    await Review.findByIdAndDelete(req.params.id);

    // Update average rating
    await updateAverageRating(targetType, targetId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Moderate review (Admin only)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin only)
exports.moderateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isModerated: req.body.isModerated },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update average rating
async function updateAverageRating(targetType, targetId) {
  const reviews = await Review.find({ targetType, targetId, isModerated: true });

  if (reviews.length === 0) return;

  const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Update the target model
  if (targetType === 'product') {
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(targetId, {
      'ratings.average': average.toFixed(1),
      'ratings.count': reviews.length,
    });
  } else if (targetType === 'driver') {
    const User = require('../models/User');
    await User.findByIdAndUpdate(targetId, {
      'ratings.average': average.toFixed(1),
      'ratings.count': reviews.length,
    });
  } else if (targetType === 'car') {
    const Car = require('../models/Car');
    await Car.findByIdAndUpdate(targetId, {
      'ratings.average': average.toFixed(1),
      'ratings.count': reviews.length,
    });
  }
}

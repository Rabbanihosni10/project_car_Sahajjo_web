const Forum = require('../models/Forum');
const { sendNotification } = require('./notificationController');

// @desc    Create a new forum post
// @route   POST /api/forum
// @access  Private (Driver/Owner only)
exports.createPost = async (req, res) => {
  try {
    const { title, content, images, image, tags, visibility, category } = req.body;

    // Only drivers and owners can post
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot create posts' });
    }

    const post = await Forum.create({
      author: req.user._id,
      category: category || 'general',
      title,
      content,
      images: images || (image ? [image] : []),
      tags: tags || [],
      visibility: visibility || 'public',
      isModerated: false,
      moderationStatus: 'pending',
    });

    await post.populate('author', 'name photo role');

    res.status(201).json({ success: true, message: 'Post submitted for admin approval', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { tag, search, category } = req.query;
    let query = { visibility: 'public', isModerated: true, moderationStatus: 'approved' };

    if (tag) {
      query.tags = tag;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Forum.find(query)
      .populate('author', 'name photo role')
      .populate('comments.user', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my forum posts (including pending ones)
// @route   GET /api/forum/my/posts
// @access  Private
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Forum.find({ author: req.user._id })
      .populate('author', 'name photo role')
      .populate('comments.user', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending posts (to approve)
// @route   GET /api/forum/pending
// @access  Private (Admin only)
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Forum.find({ moderationStatus: 'pending' })
      .populate('author', 'name photo role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get rejected posts
// @route   GET /api/forum/rejected
// @access  Private (Admin only)
exports.getRejectedPosts = async (req, res) => {
  try {
    const posts = await Forum.find({ moderationStatus: 'rejected' })
      .populate('author', 'name photo role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a post
// @route   PUT /api/forum/:id/approve
// @access  Private (Admin only)
exports.approvePost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.isModerated = true;
    post.moderationStatus = 'approved';
    await post.save();

    await sendNotification(
      post.author,
      'Community Post Approved',
      'Your community post has been approved by admin.',
      'forum',
      post._id,
      'Forum'
    );
    res.json({ success: true, message: 'Post approved', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a post
// @route   PUT /api/forum/:id/reject
// @access  Private (Admin only)
exports.rejectPost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.isModerated = false;
    post.moderationStatus = 'rejected';
    await post.save();

    await sendNotification(
      post.author,
      'Community Post Rejected',
      'Your community post has been rejected by admin.',
      'forum',
      post._id,
      'Forum'
    );
    res.json({ success: true, message: 'Post rejected', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Restore a rejected post to pending
// @route   PUT /api/forum/:id/restore
// @access  Private (Admin only)
exports.restorePost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.isModerated = false;
    post.moderationStatus = 'pending';
    await post.save();
    res.json({ success: true, message: 'Post restored to pending', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/forum/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id)
      .populate('author', 'name photo role')
      .populate('comments.user', 'name photo');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike a post
// @route   PUT /api/forum/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const likeIndex = post.likes.findIndex(like => like.toString() === userIdStr);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ success: true, likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/forum/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();
    await post.populate('comments.user', 'name photo');

    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/forum/:id
// @access  Private (Author or Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

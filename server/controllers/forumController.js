const Forum = require('../models/Forum');

// @desc    Create a new forum post
// @route   POST /api/forum
// @access  Private (Driver/Owner only)
exports.createPost = async (req, res) => {
  try {
    const { title, content, images, tags, visibility } = req.body;

    // Only drivers and owners can post
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot create posts' });
    }

    const post = await Forum.create({
      author: req.user.id,
      title,
      content,
      images: images || [],
      tags: tags || [],
      visibility: visibility || 'public',
    });

    await post.populate('author', 'name photo role');

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { tag, search } = req.query;
    let query = { visibility: 'public' };

    if (tag) {
      query.tags = tag;
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

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id);
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
      user: req.user.id,
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

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

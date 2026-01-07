import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Search, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Forum = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState('');
  const [title, setTitle] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const categories = ['general', 'maintenance', 'buy-sell', 'jobs', 'tips', 'news'];
  const [category, setCategory] = useState('general');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/forum');
      setPosts(Array.isArray(response.data) ? response.data : response.data.posts || []);
    } catch {
      console.log('Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to post');
      return;
    }
    if (!title.trim() || !newPost.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await api.post('/forum', {
        title: title.trim(),
        content: newPost.trim(),
        category,
      });
      toast.success('Post submitted for admin approval');
      setTitle('');
      setNewPost('');
      setShowPostForm(false);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/forum/${postId}/like`);
      fetchPosts();
    } catch {
      toast.error('Failed to like post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            💬 Forum
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white">Community Forum</h1>
          <p className="text-gray-600 dark:text-gray-300">Share your experiences and ask questions</p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* New Post Form */}
        {showPostForm && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold dark:text-white mb-4">Create a New Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-200 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="What would you like to discuss?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-200 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-200 mb-2">Content</label>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Share your thoughts..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-8 text-center">
            <p className="text-blue-800 dark:text-blue-200">
              <Link to="/login" className="font-bold hover:underline">
                Log in
              </Link>
              {' '}to participate in the forum
            </p>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No discussions yet</h3>
            <p className="text-gray-600 dark:text-gray-300">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold dark:text-white">{post.title}</h3>
                      {post.category && (
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{post.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLike(post._id)}
                    disabled={!isAuthenticated}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
                  >
                    <Heart className={`w-5 h-5 ${post.likes?.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      const convos = Array.isArray(response.data.conversations) 
        ? response.data.conversations 
        : response.data.data || [];
      setConversations(convos);
      setFiltered(convos);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFiltered(conversations);
    } else {
      const term = searchTerm.toLowerCase();
      setFiltered(
        conversations.filter(conv =>
          conv.otherUser?.name?.toLowerCase().includes(term) ||
          conv.otherUser?.email?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, conversations]);

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleDateString();
  };

  const truncateMessage = (msg, length = 50) => {
    return msg?.length > length ? msg.substring(0, length) + '...' : msg;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Messages
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Conversations List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2 dark:text-white">No conversations yet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm ? 'No conversations match your search' : 'Start a conversation by messaging someone'}
              </p>
            </motion.div>
          ) : (
            filtered.map((conv, index) => (
              <motion.div
                key={conv.conversationId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/messages/${conv.otherUser._id}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {conv.otherUser?.name?.charAt(0) || '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conv.otherUser?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.content ? truncateMessage(conv.lastMessage.content) : 'No messages yet'}
                    </p>
                  </div>

                  {/* Time & Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDate(conv.lastMessage?.createdAt)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;

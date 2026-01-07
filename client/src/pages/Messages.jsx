import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/conversation/${userId}`);
      setMessages(response.data.messages || []);
      
      if (response.data.messages && response.data.messages.length > 0) {
        const firstMsg = response.data.messages[0];
        const other = firstMsg.sender._id === user.id ? firstMsg.receiver : firstMsg.sender;
        setOtherUser(other);
      }
    } catch (error) {
      toast.error('Failed to load messages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId, user.id]);

  const markAsRead = useCallback(async () => {
    try {
      await api.put(`/messages/conversation/${userId}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchConversation();
      markAsRead();
    }
  }, [userId, fetchConversation, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages', {
        receiver: userId,
        content: newMessage.trim(),
      });

      setMessages([...messages, response.data.message]);
      setNewMessage('');
      
      if (!otherUser && response.data.message.receiver) {
        setOtherUser(response.data.message.receiver);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
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
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {otherUser?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {otherUser?.name || 'Loading...'}
              </h2>
              <p className="text-sm text-gray-300">{otherUser?.role}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages Container */}
      <div className="container mx-auto px-6 py-6 flex flex-col h-[calc(100vh-180px)]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.sender._id === user._id;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isMyMessage
                        ? 'bg-blue-500 text-white'
                        : 'glass dark:bg-gray-800'
                    } rounded-lg`}
                  >
                    {!isMyMessage && (
                      <p className="text-xs font-semibold px-4 pt-2 pb-1 text-blue-500 dark:text-blue-400">
                        {msg.sender?.name}
                      </p>
                    )}
                    <div className="px-4 py-2">
                      {isMyMessage && (
                        <p className="text-xs text-blue-100 mb-1">You</p>
                      )}
                      <p className={isMyMessage ? 'text-white' : 'dark:text-white'}>
                        {msg.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs px-4 pb-2 ${
                        isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="glass rounded-xl p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;

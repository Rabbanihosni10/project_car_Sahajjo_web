import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, CheckCircle, XCircle, Undo, Users, LogOut, MapPin, Package, MessageSquare, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [loadingRejected, setLoadingRejected] = useState(false);
  const [pendingGarages, setPendingGarages] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(false);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [loadingCancelRequests, setLoadingCancelRequests] = useState(false);
  const [adminResponse, setAdminResponse] = useState({});
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactFilter, setContactFilter] = useState('pending');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchPendingPosts();
    fetchRejectedPosts();
    fetchPendingGarages();
    fetchCancelRequests();
    fetchContacts();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await api.get('/forum/pending');
      setPendingPosts(response.data.posts || []);
    } catch (error) {
      toast.error('Failed to fetch pending posts');
      console.error(error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchRejectedPosts = async () => {
    setLoadingRejected(true);
    try {
      const response = await api.get('/forum/rejected');
      setRejectedPosts(response.data.posts || []);
    } catch (error) {
      toast.error('Failed to fetch rejected posts');
      console.error(error);
    } finally {
      setLoadingRejected(false);
    }
  };

  const fetchPendingGarages = async () => {
    setLoadingGarages(true);
    try {
      const response = await api.get('/garages/admin/pending');
      setPendingGarages(response.data.garages || []);
    } catch (error) {
      console.error('Failed to fetch pending garages:', error);
      setPendingGarages([]);
    } finally {
      setLoadingGarages(false);
    }
  };

  const handleApproveGarage = async (garageId) => {
    try {
      await api.put(`/garages/${garageId}/approve`);
      toast.success(`✅ Garage approved! Now visible on the map.`);
      fetchPendingGarages();
    } catch (error) {
      toast.error('Failed to approve garage');
      console.error(error);
    }
  };

  const handleRejectGarage = async (garageId) => {
    if (!confirm('Reject this garage submission?')) return;
    try {
      await api.put(`/garages/${garageId}/reject`);
      toast.success('❌ Garage rejected successfully');
      fetchPendingGarages();
    } catch (error) {
      toast.error('Failed to reject garage');
      console.error(error);
    }
  };

  const fetchCancelRequests = async () => {
    setLoadingCancelRequests(true);
    try {
      const response = await api.get('/products/orders');
      const allOrders = response.data.orders || [];
      const pending = allOrders.filter(
        (order) => order.cancelRequest && order.cancelRequest.status === 'pending'
      );
      setCancelRequests(pending);
    } catch (error) {
      console.error('Failed to fetch cancel requests:', error);
      setCancelRequests([]);
    } finally {
      setLoadingCancelRequests(false);
    }
  };

  const handleCancelRequest = async (orderId, action) => {
    const response = adminResponse[orderId] || '';
    
    if (action === 'reject' && !response.trim()) {
      toast.error('Please provide a reason for rejecting the cancellation');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this cancellation request?`)) return;

    try {
      await api.put(`/products/orders/${orderId}/cancel-request`, {
        action,
        adminResponse: response.trim(),
      });
      toast.success(`Cancellation request ${action}d successfully`);
      fetchCancelRequests();
      setAdminResponse((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (error) {
      toast.error(`Failed to ${action} cancellation request`);
      console.error(error);
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await api.get(`/contacts?status=${contactFilter}`);
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleContactStatus = async (contactId, status, adminNotes = '') => {
    try {
      await api.put(`/contacts/${contactId}/status`, { status, adminNotes });
      toast.success(`Contact marked as ${status}`);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to update contact status');
      console.error(error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Delete this contact submission?')) return;
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchContacts();
    }
  }, [contactFilter, isAdmin]);

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await api.delete(`/users/${userId}`);
      const deleted = response.data.deletedUser;
      
      setUsers(users.filter((u) => u._id !== userId));
      
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>User deleted successfully</span>
            <button
              onClick={() => handleUndoDelete(deleted, t.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <Undo className="w-4 h-4" />
              Undo
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await api.put(`/forum/${postId}/approve`);
      toast.success('Post approved');
      setPendingPosts((prev) => prev.filter((p) => p._id !== postId));
      setRejectedPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      toast.error('Failed to approve post');
      console.error(error);
    }
  };

  const handleRejectPost = async (postId) => {
    if (!confirm('Reject this post?')) return;
    try {
      await api.put(`/forum/${postId}/reject`);
      toast.success('Post rejected');
      setPendingPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      toast.error('Failed to reject post');
      console.error(error);
    }
  };

  const handleRestorePost = async (postId) => {
    try {
      await api.put(`/forum/${postId}/restore`);
      toast.success('Post restored to pending');
      setRejectedPosts((prev) => prev.filter((p) => p._id !== postId));
      fetchPendingPosts();
    } catch (error) {
      toast.error('Failed to restore post');
      console.error(error);
    }
  };

  const handleUndoDelete = async (deletedUserData, toastId) => {
    try {
      // Mock restore - In real implementation, you'd have a restore endpoint
      await api.post('/auth/register', {
        name: deletedUserData.name,
        email: deletedUserData.email,
        password: 'restored123', // Would need proper implementation
        role: deletedUserData.role,
      });
      
      toast.dismiss(toastId);
      toast.success('User restored successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to restore user');
      console.error(error);
    }
  };

  const handleApproveUser = async (userId, isApproved) => {
    try {
      await api.put(`/users/${userId}/approve`, { isApproved });
      toast.success(`User ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
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
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold gradient-text">
            🚗 Car Sahajjo Admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white">{user?.name}</span>
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">Admin</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white flex items-center gap-3">
            <Users className="w-10 h-10" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage all users, approve registrations, and moderate content
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Total Users</h3>
            <p className="text-3xl font-bold dark:text-white">{users.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Drivers</h3>
            <p className="text-3xl font-bold dark:text-white">
              {users.filter((u) => u.role === 'driver').length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Owners</h3>
            <p className="text-3xl font-bold dark:text-white">
              {users.filter((u) => u.role === 'owner').length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Pending</h3>
            <p className="text-3xl font-bold dark:text-white">
              {users.filter((u) => !u.isApproved).length}
            </p>
          </motion.div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 dark:text-white">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id, true)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id, false)}
                            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all"
                            title="Revoke"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Forum Moderation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl mt-12"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold dark:text-white">Forum Moderation</h2>
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending: {pendingPosts.length}</span>
              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Rejected: {rejectedPosts.length}</span>
            </div>
            <button
              onClick={() => { fetchPendingPosts(); fetchRejectedPosts(); }}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loadingPosts ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : pendingPosts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No pending posts to moderate.</p>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post._id} className="glass p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 capitalize">
                            {post.category}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {post.visibility}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold dark:text-white">{post.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{post.content}</p>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          By {post.author?.name} ({post.author?.role})
                        </div>
                        {post.images?.length > 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {post.images.slice(0, 3).map((img, idx) => (
                              <img key={idx} src={img} alt="post" className="w-20 h-20 object-cover rounded" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprovePost(post._id)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectPost(post._id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-10">
              <h3 className="text-xl font-semibold dark:text-white mb-4">Rejected Posts</h3>
              {loadingRejected ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-red-500"></div>
                </div>
              ) : rejectedPosts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No rejected posts.</p>
              ) : (
                <div className="space-y-4">
                  {rejectedPosts.map((post) => (
                    <div key={post._id} className="glass p-4 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 capitalize">
                              {post.category}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Rejected
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold dark:text-white">{post.title}</h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{post.content}</p>
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            By {post.author?.name} ({post.author?.role})
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestorePost(post._id)}
                            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2"
                          >
                            <Undo className="w-4 h-4" /> Restore
                          </button>
                          <button
                            onClick={() => handleApprovePost(post._id)}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Garage Moderation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl mt-12"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-semibold dark:text-white">Garage Submissions</h2>
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Pending: {pendingGarages.length}
              </span>
            </div>
            <button
              onClick={fetchPendingGarages}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loadingGarages ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-orange-500"></div>
              </div>
            ) : pendingGarages.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No pending garage submissions.</p>
            ) : (
              <div className="space-y-4">
                {pendingGarages.map((garage) => (
                  <div key={garage._id} className="glass p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold dark:text-white">{garage.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{garage.address}</p>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {garage.phone && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <p className="dark:text-white">{garage.phone}</p>
                            </div>
                          )}
                          {garage.email && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <p className="dark:text-white break-all">{garage.email}</p>
                            </div>
                          )}
                          {garage.website && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Website:</span>
                              <p className="dark:text-white truncate">{garage.website}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Submitted by:</span>
                            <p className="dark:text-white">{garage.submittedBy?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        {garage.services?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Services:</span>
                            <div className="flex gap-2 flex-wrap mt-1">
                              {garage.services.map((service, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {garage.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{garage.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveGarage(garage._id)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectGarage(garage._id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Cancellation Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-xl mt-12"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold dark:text-white">Order Cancellation Requests</h2>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Pending: {cancelRequests.length}
              </span>
            </div>
            <button
              onClick={fetchCancelRequests}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loadingCancelRequests ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : cancelRequests.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No pending cancellation requests.</p>
            ) : (
              <div className="space-y-4">
                {cancelRequests.map((order) => (
                  <div key={order._id} className="glass p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold dark:text-white">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Customer: <strong>{order.user?.name}</strong> ({order.user?.email})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Order Total: <strong className="text-blue-600">৳{order.totalAmount.toLocaleString()}</strong>
                        </p>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded mt-2">
                          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">
                            Cancellation Reason:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">

        {/* Contact Submissions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass p-8 rounded-xl mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Contact Submissions
            </h2>
            <div className="flex gap-2">
              <select
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={fetchContacts}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Total Contacts: {contacts.length}
          </div>

          {loadingContacts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No contact submissions found
            </p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">
                        {contact.subject}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        From: {contact.name} ({contact.user?.role || contact.userType})
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email: {contact.email} | Phone: {contact.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Submitted: {new Date(contact.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contact.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : contact.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {contact.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {contact.message}
                    </p>
                  </div>

                  {contact.adminNotes && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-semibold dark:text-white mb-1">
                        Admin Notes:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {contact.adminNotes}
                      </p>
                      {contact.reviewedBy && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {contact.reviewedBy.name} at{' '}
                          {new Date(contact.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {contact.status !== 'reviewed' && (
                      <button
                        onClick={() => {
                          const notes = prompt('Add admin notes (optional):');
                          handleContactStatus(contact._id, 'reviewed', notes || '');
                        }}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark as Reviewed
                      </button>
                    )}
                    {contact.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          const notes = prompt('Add resolution notes (optional):');
                          handleContactStatus(contact._id, 'resolved', notes || '');
                        }}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
                            "{order.cancelRequest.reason}"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Requested: {new Date(order.cancelRequest.requestedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-semibold dark:text-white mb-1">
                            Admin Response (optional for approval, required for rejection):
                          </label>
                          <textarea
                            placeholder="Enter response to user..."
                            value={adminResponse[order._id] || ''}
                            onChange={(e) =>
                              setAdminResponse((prev) => ({ ...prev, [order._id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancelRequest(order._id, 'approve')}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleCancelRequest(order._id, 'reject')}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;

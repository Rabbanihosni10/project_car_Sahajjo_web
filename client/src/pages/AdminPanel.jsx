import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, CheckCircle, XCircle, Undo, Users, LogOut } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
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
      </div>
    </div>
  );
};

export default AdminPanel;

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, User, MapPin, Briefcase, MessageCircle, ShoppingCart, Car, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/Notifications/NotificationBell';

const Dashboard = () => {
  const { user, logout, logoutAll, isAdmin, isDriver, isOwner } = useAuth();
  const [stats, setStats] = useState({
    jobs: 0,
    bookings: 0,
    posts: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch relevant stats based on role
      if (isDriver) {
        const jobsRes = await api.get('/jobs/my/applications');
        setStats(prev => ({ ...prev, jobs: jobsRes.data.count }));
      } else if (isOwner) {
        const jobsRes = await api.get('/jobs/my/posted');
        setStats(prev => ({ ...prev, jobs: jobsRes.data.count }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [isDriver, isOwner]);

  useEffect(() => {
    if (isDriver || isOwner) {
      fetchStats();
    }
  }, [fetchStats, isDriver, isOwner]);

  const quickActions = isAdmin
    ? [
        { icon: <User />, title: 'Manage Users', link: '/admin', color: 'bg-blue-500' },
        { icon: <Briefcase />, title: 'Review Jobs', link: '/admin/jobs', color: 'bg-purple-500' },
        { icon: <MessageCircle />, title: 'Forum Posts', link: '/admin/forum', color: 'bg-green-500' },
        { icon: <ShoppingCart />, title: 'Marketplace', link: '/marketplace', color: 'bg-indigo-500' },
      ]
    : isDriver
    ? [
        { icon: <Briefcase />, title: 'Find Jobs', link: '/jobs', color: 'bg-blue-500' },
        { icon: <User />, title: 'My Applications', link: '/jobs/my-applications', color: 'bg-purple-500' },
        { icon: <MessageCircle />, title: 'Messages', link: '/messages', color: 'bg-green-500' },
        { icon: <MessageSquare />, title: 'Forum', link: '/forum', color: 'bg-cyan-500' },
        { icon: <MapPin />, title: 'Service Centers', link: '/map', color: 'bg-red-500' },
        { icon: <ShoppingCart />, title: 'Marketplace', link: '/marketplace', color: 'bg-indigo-500' },
      ]
    : [
        { icon: <Car />, title: 'My Cars', link: '/cars', color: 'bg-blue-500' },
        { icon: <Briefcase />, title: 'Post Job', link: '/jobs/create', color: 'bg-purple-500' },
        { icon: <User />, title: 'My Jobs', link: '/jobs/my-posted', color: 'bg-green-500' },
        { icon: <MessageCircle />, title: 'Messages', link: '/messages', color: 'bg-orange-500' },
        { icon: <MessageSquare />, title: 'Forum', link: '/forum', color: 'bg-cyan-500' },
        { icon: <MapPin />, title: 'Find Drivers', link: '/map', color: 'bg-red-500' },
        { icon: <ShoppingCart />, title: 'Marketplace', link: '/marketplace', color: 'bg-indigo-500' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold gradient-text">
            🚗 Car Sahajjo
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <span className="text-white">{user?.name}</span>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={logoutAll}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2 transition-all"
              title="Logout from all devices"
            >
              <LogOut className="w-4 h-4" />
              Logout Everywhere
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isAdmin
              ? 'Manage the platform and review content'
              : isDriver
              ? 'Find new job opportunities and connect with car owners'
              : 'Manage your cars and find drivers'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">
              {isDriver ? 'Applications' : 'Job Posts'}
            </h3>
            <p className="text-3xl font-bold dark:text-white">{stats.jobs}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Bookings</h3>
            <p className="text-3xl font-bold dark:text-white">{stats.bookings}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">Forum Posts</h3>
            <p className="text-3xl font-bold dark:text-white">{stats.posts}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.link}
                  className={`${action.color} p-6 rounded-xl text-white hover:shadow-2xl transform hover:scale-105 transition-all block`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-4">{action.icon}</div>
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 glass p-8 rounded-xl"
        >
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Name</p>
              <p className="font-semibold dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Role</p>
              <p className="font-semibold dark:text-white capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Account Status</p>
              <p className="font-semibold">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user?.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {user?.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="mt-6 inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Edit Profile
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

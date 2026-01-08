import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, User, MapPin, Briefcase, MessageCircle, ShoppingCart, Car, MessageSquare, Languages, Calendar, Mail } from 'lucide-react';
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
    rentedSold: 0,
  });
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      console.log('Fetching stats for user:', user._id, 'isDriver:', isDriver, 'isOwner:', isOwner);
      
      // Fetch relevant stats based on role
      if (isDriver) {
        const jobsRes = await api.get('/jobs/my/applications');
        console.log('Jobs response:', jobsRes.data);
        setStats(prev => ({ ...prev, jobs: jobsRes.data.count }));

        // Fetch driver's bookings
        try {
          const bookingsRes = await api.get('/bookings/driver/my');
          console.log('Driver bookings response:', bookingsRes.data);
          setStats(prev => ({ 
            ...prev, 
            bookings: bookingsRes.data.stats.approved + bookingsRes.data.stats.active 
          }));
        } catch (bookingError) {
          console.error('Error fetching driver bookings:', bookingError);
        }
      } else if (isOwner) {
        const jobsRes = await api.get('/jobs/my/posted');
        console.log('Jobs response:', jobsRes.data);
        setStats(prev => ({ ...prev, jobs: jobsRes.data.count }));

        // Fetch owner's bookings stats
        try {
          const bookingsRes = await api.get('/bookings/owner/all');
          console.log('Owner bookings response:', bookingsRes.data);
          setStats(prev => ({ 
            ...prev, 
            bookings: bookingsRes.data.stats.pending || 0,
            rentedSold: (bookingsRes.data.stats.rented || 0) + (bookingsRes.data.stats.sold || 0)
          }));
        } catch (bookingError) {
          console.error('Error fetching owner bookings:', bookingError);
        }
      }
      
      // Fetch forum posts count for current user (including pending ones)
      try {
        const forumRes = await api.get('/forum/my/posts');
        console.log('Forum response:', forumRes.data);
        setStats(prev => ({ ...prev, posts: forumRes.data.count }));
      } catch (forumError) {
        console.error('Error fetching forum stats:', forumError.response?.data || forumError.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [isDriver, isOwner, user._id]);

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
        { icon: <Languages />, title: 'AI Chat', link: '/assistant/chat', color: 'bg-teal-500' },
        { icon: <Languages />, title: 'Translator', link: '/assistant/translate', color: 'bg-emerald-500' },
      ]
    : isDriver
    ? [
        { icon: <Car />, title: 'Browse Cars', link: '/cars', color: 'bg-blue-500' },
        { icon: <Briefcase />, title: 'Find Jobs', link: '/jobs', color: 'bg-purple-500' },
        { icon: <User />, title: 'My Applications', link: '/jobs/my-applications', color: 'bg-green-500' },
        { icon: <Calendar />, title: 'My Bookings', link: '/bookings/my', color: 'bg-pink-500' },
        { icon: <MessageCircle />, title: 'Messages', link: '/messages', color: 'bg-orange-500' },
        { icon: <MessageSquare />, title: 'Forum', link: '/forum', color: 'bg-cyan-500' },
        { icon: <MapPin />, title: 'Service Centers', link: '/map', color: 'bg-red-500' },
          { icon: <Languages />, title: 'AI Chat', link: '/assistant/chat', color: 'bg-teal-500' },
          { icon: <Languages />, title: 'Translator', link: '/assistant/translate', color: 'bg-emerald-500' },
        { icon: <ShoppingCart />, title: 'Marketplace', link: '/marketplace', color: 'bg-indigo-500' },
      ]
    : [
        { icon: <Car />, title: 'My Cars', link: '/cars', color: 'bg-blue-500' },
        { icon: <Briefcase />, title: 'Post Job', link: '/jobs/create', color: 'bg-purple-500' },
        { icon: <User />, title: 'My Jobs', link: '/jobs/my-posted', color: 'bg-green-500' },
        { icon: <Calendar />, title: 'Booking Requests', link: '/bookings/requests', color: 'bg-pink-500' },
        { icon: <MessageCircle />, title: 'Messages', link: '/messages', color: 'bg-orange-500' },
        { icon: <MessageSquare />, title: 'Forum', link: '/forum', color: 'bg-cyan-500' },
        { icon: <MapPin />, title: 'Find Drivers', link: '/map', color: 'bg-red-500' },
          { icon: <Languages />, title: 'AI Chat', link: '/assistant/chat', color: 'bg-teal-500' },
          { icon: <Languages />, title: 'Translator', link: '/assistant/translate', color: 'bg-emerald-500' },
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold dark:text-white">Your Stats</h2>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
          >
            🔄 Refresh
          </button>
        </div>
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
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">
              {isDriver ? 'My Bookings' : 'Pending Requests'}
            </h3>
            <p className="text-3xl font-bold dark:text-white">{stats.bookings}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">
              {isOwner ? 'Rented/Sold Cars' : 'Forum Posts'}
            </h3>
            <p className="text-3xl font-bold dark:text-white">{isOwner ? stats.rentedSold : stats.posts}</p>
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
          <div className="mt-6 flex gap-4">
            {!isAdmin && (
              <button
                onClick={() => setContactModalOpen(true)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Admin
              </button>
            )}
            <Link
              to="/profile"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

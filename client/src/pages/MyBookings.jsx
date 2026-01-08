import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/driver/my');
      setBookings(response.data.bookings);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { bg: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { bg: 'bg-red-100 text-red-800', text: 'Rejected' },
      active: { bg: 'bg-blue-100 text-blue-800', text: 'Active' },
      completed: { bg: 'bg-gray-100 text-gray-800', text: 'Completed' },
      cancelled: { bg: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg}`}>{config.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            🚗 My Bookings
          </Link>
          <Link to="/dashboard" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 rounded-xl text-center"
          >
            <h3 className="text-2xl font-bold dark:text-white">{stats.total || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-xl text-center"
          >
            <h3 className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-4 rounded-xl text-center"
          >
            <h3 className="text-2xl font-bold text-green-600">{stats.approved || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-4 rounded-xl text-center"
          >
            <h3 className="text-2xl font-bold text-blue-600">{stats.active || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Active</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-4 rounded-xl text-center"
          >
            <h3 className="text-2xl font-bold text-gray-600">{stats.completed || 0}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected', 'active', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="glass p-12 rounded-xl text-center">
            <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2 dark:text-white">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start by requesting a car booking!</p>
            <Link to="/cars" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Car Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {booking.car?.images?.[0] ? (
                      <img
                        src={booking.car.images[0]}
                        alt={`${booking.car.brand} ${booking.car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">
                          {booking.car?.brand} {booking.car?.model} ({booking.car?.year})
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.bookingType === 'buy' ? 'Purchase' : 'Rental'}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {booking.bookingType === 'rent' && booking.startDate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Calendar size={16} />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Clock size={16} />
                          <span>{booking.rateType} rate</span>
                        </div>
                      </div>
                    )}

                    {(booking.pickupLocation || booking.dropLocation) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                        {booking.pickupLocation && (
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin size={16} className="mt-0.5" />
                            <span>Pickup: {booking.pickupLocation}</span>
                          </div>
                        )}
                        {booking.dropLocation && (
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin size={16} className="mt-0.5" />
                            <span>Drop: {booking.dropLocation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={20} className="text-blue-500" />
                      <span className="text-xl font-bold text-blue-500">
                        ৳{booking.totalAmount.toLocaleString()}
                      </span>
                      {booking.securityDeposit > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          + ৳{booking.securityDeposit.toLocaleString()} deposit
                        </span>
                      )}
                    </div>

                    {booking.driverMessage && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm font-semibold dark:text-white mb-1">Your Message:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{booking.driverMessage}</p>
                      </div>
                    )}

                    {booking.ownerResponse && (
                      <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                        <p className="text-sm font-semibold dark:text-white mb-1">Owner's Response:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{booking.ownerResponse}</p>
                      </div>
                    )}

                    {booking.rejectionReason && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                        <p className="text-sm font-semibold dark:text-white mb-1">Rejection Reason:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{booking.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Requested: {new Date(booking.createdAt).toLocaleString()}</span>
                      {booking.approvedAt && (
                        <span>• Approved: {new Date(booking.approvedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

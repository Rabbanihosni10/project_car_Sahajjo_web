import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrderHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/orders/history');
      const ordersList = response.data.orders || [];
      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch (error) {
      console.error('Failed to fetch order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(term) ||
          order.items.some((item) => item.product?.name?.toLowerCase().includes(term))
      );
    }

    setFilteredOrders(filtered);
  }, [statusFilter, searchTerm, orders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Package className="w-7 h-7" />
            Order History
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold dark:text-white mb-2">Complete Order History</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View all your past and current orders
          </p>
        </motion.div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold dark:text-white mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold dark:text-white mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing <span className="font-bold">{filteredOrders.length}</span> of{' '}
            <span className="font-bold">{orders.length}</span> orders
          </p>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass rounded-xl"
          >
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {orders.length === 0
                ? 'Start shopping in the marketplace'
                : 'Try adjusting your search or filters'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold dark:text-white mb-1">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {order.deliveredAt && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {order.items.length} item(s)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm dark:text-white truncate">
                            {item.product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
                  >
                    View Details
                  </Link>
                  {order.orderStatus === 'delivered' && (
                    <button
                      onClick={() => toast.info('Review feature coming soon!')}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm"
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock, CheckCircle, XCircle, Truck, AlertCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/orders/my/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getCancelRequestBadge = (cancelRequest) => {
    if (!cancelRequest || cancelRequest.status === 'none') return null;
    
    const badges = {
      pending: <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Cancel Pending</span>,
      approved: <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Cancel Approved</span>,
      rejected: <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancel Rejected</span>,
    };
    return badges[cancelRequest.status];
  };

  const handleCancelRequest = (order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
    setCancelReason('');
  };

  const submitCancelRequest = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/products/orders/${selectedOrder._id}/cancel-request`, {
        reason: cancelReason.trim(),
      });
      toast.success('Cancellation request submitted successfully');
      setCancelModalOpen(false);
      setSelectedOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      console.error('Cancel request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setSubmitting(false);
    }
  };

  const canRequestCancel = (order) => {
    return (
      order.orderStatus !== 'delivered' &&
      order.orderStatus !== 'cancelled' &&
      (!order.cancelRequest || order.cancelRequest.status === 'none' || order.cancelRequest.status === 'rejected')
    );
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
            My Orders
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold dark:text-white">Your Orders</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track and manage your orders
              </p>
            </div>
            <Link
              to="/order-history"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              View Full History
            </Link>
          </div>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No orders yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start shopping in the marketplace
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold dark:text-white">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    {getCancelRequestBadge(order.cancelRequest)}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 mb-3">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold dark:text-white">{item.product?.name || 'Product'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} × ৳{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold dark:text-white">
                        ৳{(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="dark:text-white">৳{order.subtotal?.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span>Discount:</span>
                      <span>-৳{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <span className="dark:text-white">৳{order.shipping?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="dark:text-white">Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">৳{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {order.cancelRequest && order.cancelRequest.status !== 'none' && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Cancellation Request
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <strong>Reason:</strong> {order.cancelRequest.reason}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested: {new Date(order.cancelRequest.requestedAt).toLocaleDateString()}
                    </p>
                    {order.cancelRequest.status === 'rejected' && order.cancelRequest.adminResponse && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        <strong>Admin Response:</strong> {order.cancelRequest.adminResponse}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                  >
                    View Details
                  </Link>
                  {canRequestCancel(order) && (
                    <button
                      onClick={() => handleCancelRequest(order)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      Request Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Request Modal */}
      <AnimatePresence>
        {cancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setCancelModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Request Cancellation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please provide a reason for cancelling this order:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Changed my mind, Found better price, Ordered by mistake..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                rows={4}
                disabled={submitting}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => !submitting && setCancelModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCancelRequest}
                  disabled={submitting || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle, MessageSquare, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/orders/${id}`);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelRequest = () => {
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
      await api.post(`/products/orders/${id}/cancel-request`, {
        reason: cancelReason.trim(),
      });
      toast.success('Cancellation request submitted successfully');
      setCancelModalOpen(false);
      setCancelReason('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Cancel request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setSubmitting(false);
    }
  };

  const canRequestCancel = () => {
    if (!order) return false;
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-2xl font-bold dark:text-white mb-2">Order Not Found</h3>
          <button
            onClick={() => navigate('/my-orders')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Back to Orders
          </button>
        </div>
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
            Order Details
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 shadow-lg"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-3xl font-bold dark:text-white mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${getStatusColor(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold dark:text-white mb-6">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg dark:text-white">{item.product?.name || 'Product'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      SKU: {item.product?.sku || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Category: {item.product?.category || 'N/A'}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm">Quantity: <span className="font-semibold">{item.quantity}</span></span>
                      <span className="text-sm">Unit Price: <span className="font-semibold">৳{item.price.toLocaleString()}</span></span>
                      <span className="text-lg font-bold dark:text-blue-400">৳{(item.quantity * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold dark:text-white">৳{order.subtotal?.toLocaleString() || '0'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <span className="font-semibold dark:text-white">৳{order.shipping?.toLocaleString() || '0'}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center text-lg font-bold">
                <span className="dark:text-white">Total Amount:</span>
                <span className="text-blue-600 dark:text-blue-400">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Request Info */}
          {order.cancelRequest && order.cancelRequest.status !== 'none' && (
            <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Cancellation Request
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Status:</strong> {order.cancelRequest.status.toUpperCase()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Reason:</strong> {order.cancelRequest.reason}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Requested:</strong> {new Date(order.cancelRequest.requestedAt).toLocaleDateString()}
              </p>
              {order.cancelRequest.status === 'rejected' && order.cancelRequest.adminResponse && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  <strong>Admin Response:</strong> {order.cancelRequest.adminResponse}
                </p>
              )}
            </div>
          )}

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold dark:text-white mb-4">Delivery Address</h3>
              <p className="text-gray-800 dark:text-gray-200">{order.deliveryAddress.address}</p>
              <p className="text-gray-800 dark:text-gray-200">{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
              <p className="text-gray-800 dark:text-gray-200">{order.deliveryAddress.country}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-orders')}
              className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              Back to Orders
            </button>
            {canRequestCancel() && (
              <button
                onClick={handleCancelRequest}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Request Cancellation
              </button>
            )}
          </div>
        </motion.div>
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

export default OrderDetails;

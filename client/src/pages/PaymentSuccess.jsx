import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  const tranId = searchParams.get('tran_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const validatePayment = async () => {
      try {
        if (!tranId) {
          setError('No transaction ID found');
          setLoading(false);
          return;
        }

        // Validate payment with backend using transaction ID
        const response = await api.post('/payments/validate', {
          val_id: tranId,
        });

        if (response.data.success) {
          setPaymentDetails({
            transactionId: tranId,
            bookingId: bookingId,
            status: 'Successful',
            amount: response.data.data?.amount || response.data.amount || 'N/A',
          });
          toast.success('Payment completed successfully!');
        } else {
          setError('Payment validation failed. Please check your transaction.');
          toast.error('Payment validation failed');
        }
      } catch (err) {
        console.error('Validation error:', err);
        setError(err.response?.data?.message || 'Failed to validate payment');
        toast.error('Failed to validate payment');
      } finally {
        setLoading(false);
      }
    };

    validatePayment();
  }, [tranId, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold dark:text-white mb-3">Payment Successful!</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your booking payment has been processed successfully. You will receive a confirmation email shortly.
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
              <span className="font-mono text-sm dark:text-white">{paymentDetails.transactionId}</span>
            </div>
            {paymentDetails.bookingId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="font-mono text-sm dark:text-white">{paymentDetails.bookingId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">{paymentDetails.status}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/my-bookings"
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Your 50% advance payment has been received. Remaining 50% is due at vehicle pickup.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get('tran_id');

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
          <XCircle className="w-24 h-24 mx-auto text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold dark:text-white mb-3">Payment Failed</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
        </p>

        {tranId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Transaction ID:</p>
            <p className="font-mono text-sm dark:text-white break-all">{tranId}</p>
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Your booking has been created but payment is pending. Please try payment again.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Retry Payment
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/my-bookings"
            className="w-full px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Back to Home
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          If you continue to experience issues, please contact our support team.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentFail;

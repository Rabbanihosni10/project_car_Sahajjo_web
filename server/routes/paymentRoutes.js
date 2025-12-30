const express = require('express');
const router = express.Router();
const {
  initPayment,
  validatePayment,
  handleIPN,
  getTransactionStatus,
  initiateRefund,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/init', protect, initPayment);
router.post('/validate', protect, validatePayment);
router.post('/ipn', handleIPN);
router.get('/status/:transactionId', protect, getTransactionStatus);
router.post('/refund', protect, authorize('admin'), initiateRefund);

module.exports = router;

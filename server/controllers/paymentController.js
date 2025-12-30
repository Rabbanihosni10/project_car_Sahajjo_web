const SSLCommerzPayment = require('sslcommerz-lts');

// SSLCommerz Sandbox Credentials
const store_id = 'skill6800aa2b1a8fd';
const store_passwd = 'skill6800aa2b1a8fd@ssl';
const is_live = false; // true for live, false for sandbox

// @desc    Initialize SSLCommerz Payment
// @route   POST /api/payment/init
// @access  Private
exports.initPayment = async (req, res) => {
  try {
    const { amount, productName, productCategory, orderId } = req.body;
    const user = req.user;

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `http://localhost:5173/payment/success?tran_id=${transactionId}&order_id=${orderId}`,
      fail_url: `http://localhost:5173/payment/fail?tran_id=${transactionId}`,
      cancel_url: `http://localhost:5173/payment/fail?tran_id=${transactionId}`,
      ipn_url: 'http://localhost:5000/api/payment/ipn',
      shipping_method: 'NO',
      product_name: productName || 'Car Sahajjo Service',
      product_category: productCategory || 'Service',
      product_profile: 'general',
      cus_name: user.name,
      cus_email: user.email,
      cus_add1: user.address || 'Dhaka',
      cus_add2: 'Bangladesh',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: user.phone || '01700000000',
      cus_fax: '01700000000',
      ship_name: user.name,
      ship_add1: 'Dhaka',
      ship_add2: 'Bangladesh',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      res.json({
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        transactionId: transactionId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment gateway initialization failed',
      });
    }
  } catch (error) {
    console.error('Payment Init Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization error',
      error: error.message,
    });
  }
};

// @desc    Validate SSLCommerz Payment
// @route   POST /api/payment/validate
// @access  Private
exports.validatePayment = async (req, res) => {
  try {
    const { val_id } = req.body;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validationResponse = await sslcz.validate({ val_id });

    if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
      // Payment is valid, update order status in database
      res.json({
        success: true,
        message: 'Payment validated successfully',
        data: validationResponse,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment validation failed',
        data: validationResponse,
      });
    }
  } catch (error) {
    console.error('Payment Validation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment validation error',
      error: error.message,
    });
  }
};

// @desc    Handle IPN (Instant Payment Notification)
// @route   POST /api/payment/ipn
// @access  Public
exports.handleIPN = async (req, res) => {
  try {
    const ipnData = req.body;
    console.log('IPN Received:', ipnData);

    // Process IPN data and update database accordingly
    // This is called by SSLCommerz after payment completion

    res.status(200).send('IPN Received');
  } catch (error) {
    console.error('IPN Error:', error);
    res.status(500).send('IPN Error');
  }
};

// @desc    Get Transaction Status
// @route   GET /api/payment/status/:transactionId
// @access  Private
exports.getTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const response = await sslcz.transactionQueryByTransactionId({
      tran_id: transactionId,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Transaction Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction status',
      error: error.message,
    });
  }
};

// @desc    Initiate Refund
// @route   POST /api/payment/refund
// @access  Private (Admin only)
exports.initiateRefund = async (req, res) => {
  try {
    const { bank_tran_id, refund_amount, refund_remarks } = req.body;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const refundResponse = await sslcz.initiateRefund({
      refund_amount,
      refund_remarks: refund_remarks || 'Refund requested by admin',
      bank_tran_id,
      refe_id: `REF${Date.now()}`,
    });

    if (refundResponse.status === 'success') {
      res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: refundResponse,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund initiation failed',
        data: refundResponse,
      });
    }
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund error',
      error: error.message,
    });
  }
};

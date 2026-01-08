const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  verifyProduct,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  requestCancelOrder,
  handleCancelRequest,
  getOrderHistory,
  getCancelledOrders,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');

// Product routes
router.post('/', protect, createProduct);
router.get('/', getAllProducts);
router.get('/my/products', protect, getMyProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/verify', protect, authorize('admin'), verifyProduct);

// Order routes
router.post('/orders', protect, createOrder);
router.get('/orders', protect, authorize('admin'), getAllOrders);
router.get('/orders/my/orders', protect, getMyOrders);
router.get('/orders/history', protect, getOrderHistory);
router.get('/orders/cancelled', protect, authorize('admin'), getCancelledOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/status', protect, authorize('admin'), updateOrderStatus);
router.post('/orders/:id/cancel-request', protect, requestCancelOrder);
router.put('/orders/:id/cancel-request', protect, authorize('admin'), handleCancelRequest);

module.exports = router;

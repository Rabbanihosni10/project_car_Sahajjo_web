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
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;

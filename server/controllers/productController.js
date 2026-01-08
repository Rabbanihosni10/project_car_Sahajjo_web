const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendNotification } = require('./notificationController');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = async (req, res) => {
  try {
    const { image, images } = req.body;
    const productData = {
      ...req.body,
      images: images && images.length ? images : (image ? [image] : []),
      seller: req.user._id,
    };

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, isVerified } = req.query;

    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email phone');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my products
// @route   GET /api/products/my/products
// @access  Private
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify product (Admin only)
// @route   PUT /api/products/:id/verify
// @access  Private (Admin only)
exports.verifyProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ===== ORDER MANAGEMENT =====

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, discountCode, subtotal, discount, shipping, total } = req.body;

    // Validate input
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Incomplete shipping address' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price || product.price,
      });

      totalAmount += (item.price || product.price) * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply discount if provided
    const discountAmount = discount || 0;
    const shippingCost = shipping || 100;
    const finalTotal = (total || totalAmount + shippingCost - discountAmount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: finalTotal,
      subtotal: subtotal || totalAmount,
      discount: discountAmount,
      discountCode: discountCode || null,
      shipping: shippingCost,
      paymentMethod: paymentMethod || 'card',
      shippingAddress,
    });

    await order.populate('items.product');

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
      }
      
      // Notify user of status change
      const statusMessages = {
        processing: 'Your order is now being processed',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      };
      
      if (statusMessages[orderStatus]) {
        await sendNotification(
          order.user._id,
          'Order Status Update',
          statusMessages[orderStatus],
          'order',
          order._id,
          'Order'
        );
      }
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request order cancellation
// @route   POST /api/orders/:id/cancel-request
// @access  Private (User)
exports.requestCancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot request cancellation for ${order.orderStatus} orders` 
      });
    }

    // Check if already has pending cancel request
    if (order.cancelRequest && order.cancelRequest.status === 'pending') {
      return res.status(400).json({ 
        message: 'You already have a pending cancellation request for this order' 
      });
    }

    order.cancelRequest = {
      status: 'pending',
      reason: reason.trim(),
      requestedAt: new Date(),
    };

    await order.save();

    // Notify admins about cancel request
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        sendNotification(
          admin._id,
          'Order Cancellation Request',
          `User ${req.user.name} requested to cancel order #${order._id.toString().slice(-6)}`,
          'order',
          order._id,
          'Order'
        )
      )
    );

    res.json({ 
      success: true, 
      message: 'Cancellation request submitted successfully',
      order 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle cancel request (Admin approves/rejects)
// @route   PUT /api/orders/:id/cancel-request
// @access  Private (Admin only)
exports.handleCancelRequest = async (req, res) => {
  try {
    const { action, adminResponse } = req.body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.cancelRequest || order.cancelRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending cancel request for this order' });
    }

    if (action === 'approve') {
      order.cancelRequest.status = 'approved';
      order.orderStatus = 'cancelled';
      order.paymentStatus = 'refunded';
      
      // Restore product stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      await sendNotification(
        order.user._id,
        'Cancellation Approved',
        `Your cancellation request for order #${order._id.toString().slice(-6)} has been approved. Refund will be processed shortly.`,
        'order',
        order._id,
        'Order'
      );
    } else {
      order.cancelRequest.status = 'rejected';
      
      await sendNotification(
        order.user._id,
        'Cancellation Rejected',
        `Your cancellation request for order #${order._id.toString().slice(-6)} has been rejected.${adminResponse ? ' Reason: ' + adminResponse : ''}`,
        'order',
        order._id,
        'Order'
      );
    }

    order.cancelRequest.adminResponse = adminResponse || '';
    order.cancelRequest.respondedAt = new Date();
    order.cancelRequest.respondedBy = req.user._id;

    await order.save();

    res.json({ 
      success: true, 
      message: `Cancellation request ${action}d successfully`,
      order 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order history (all orders for current user)
// @route   GET /api/orders/history
// @access  Private
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all cancelled orders
// @route   GET /api/orders/cancelled
// @access  Private (Admin only)
exports.getCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: 'cancelled' })
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

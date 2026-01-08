import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Gift, CreditCard, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (productId, delta) => {
    const newCart = cart.map(item => {
      if (item._id === productId) {
        const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + delta));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item._id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const applyDiscount = () => {
    // Simple discount code validation
    const validCodes = {
      'SAVE10': 0.10,
      'SAVE20': 0.20,
      'WELCOME': 0.15,
    };

    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    if (validCodes[discountCode.toUpperCase()]) {
      const discount = validCodes[discountCode.toUpperCase()];
      setDiscountApplied({
        code: discountCode.toUpperCase(),
        percentage: discount * 100,
        amount: calculateTotal() * discount,
      });
      toast.success(`Discount code applied! ${discount * 100}% off`);
      setDiscountCode('');
    } else {
      toast.error('Invalid discount code');
    }
  };

  const removeCoupon = () => {
    setDiscountApplied(null);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      toast.error('Please fill in all shipping details');
      return;
    }

    setLoading(true);

    try {
      const subtotal = calculateTotal();
      const discount = discountApplied ? discountApplied.amount : 0;
      const shippingCost = 100;
      const total = subtotal - discount + shippingCost;

      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        discountCode: discountApplied?.code || null,
        subtotal,
        discount,
        shipping: shippingCost,
        total,
      };

      const response = await api.post('/products/orders', orderData);
      
      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');
      setDiscountApplied(null);
      setShippingAddress({ street: '', city: '', state: '', zipCode: '', phone: '' });
      
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </button>
          <div className="text-2xl font-bold gradient-text">🛒 Shopping Cart</div>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h3 className="text-3xl font-bold mb-4 dark:text-white">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start shopping to add items to your cart
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex gap-4"
                >
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.images && item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold dark:text-white mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {item.category} {item.brand && `• ${item.brand}`}
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                      ৳{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* Discount Code Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Discount Code
                </h3>
                
                {discountApplied ? (
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Code Applied: {discountApplied.code}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Saving ৳{discountApplied.amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-600 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={applyDiscount}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
                    >
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Try codes: SAVE10, SAVE20, or WELCOME
                </p>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-28"
              >
                <h2 className="text-2xl font-bold dark:text-white mb-6">Order Summary</h2>

                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal ({cart.length} items)</span>
                    <span className="font-bold dark:text-white">
                      ৳{calculateTotal().toLocaleString()}
                    </span>
                  </div>

                  {discountApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({discountApplied.percentage}%)</span>
                      <span className="font-bold">-৳{discountApplied.amount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="font-bold dark:text-white">৳100</span>
                  </div>

                  <div className="flex justify-between text-xl pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold dark:text-white">Total</span>
                    <span className="font-bold text-blue-500 text-2xl">
                      ৳{(calculateTotal() - (discountApplied?.amount || 0) + 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Method Section */}
                <form onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Payment Method
                  </h3>

                  <div className="space-y-2 mb-6">
                    {[
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'bkash', label: 'bKash' },
                      { id: 'nagad', label: 'Nagad' },
                      { id: 'cod', label: 'Cash on Delivery' },
                    ].map(method => (
                      <label key={method.id} className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="dark:text-white font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  <h3 className="font-bold dark:text-white mb-4">Shipping Address</h3>
                  
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="ZIP Code"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

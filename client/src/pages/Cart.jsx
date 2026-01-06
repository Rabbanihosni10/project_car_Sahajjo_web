import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress,
      };

      const response = await api.post('/products/orders', orderData);
      
      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');
      
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link to="/marketplace" className="text-2xl font-bold gradient-text">
            ← Back to Marketplace
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">Your cart is empty</h3>
            <Link to="/marketplace" className="text-blue-500 hover:underline">
              Continue Shopping
            </Link>
          </div>
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
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold dark:text-white mb-6">Order Summary</h2>

                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="font-bold dark:text-white">
                      ৳{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                    <span className="font-bold dark:text-white">৳100</span>
                  </div>
                  <div className="flex justify-between text-xl pt-4">
                    <span className="font-bold dark:text-white">Total</span>
                    <span className="font-bold text-blue-500">
                      ৳{(calculateTotal() + 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="font-bold dark:text-white mb-4">Shipping Address</h3>
                  
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                  >
                    Proceed to Payment
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

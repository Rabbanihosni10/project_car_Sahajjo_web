import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        toast.error('Failed to load product details');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const addToCart = () => {
    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    let newCart;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      newCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`Added ${quantity} item(s) to cart!`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold dark:text-white mb-4">Product not found</h1>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </button>
          <div className="text-2xl font-bold gradient-text">🛍️ Product Details</div>
          <div className="w-32"></div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-32 h-32 text-gray-400" />
              )}
              {product.isVerified && (
                <span className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4" /> Verified
                </span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category and Brand */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
              {product.brand && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-sm font-semibold">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-4xl font-bold mb-2 dark:text-white">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
              <p className="text-sm font-semibold opacity-90 mb-1">Price</p>
              <p className="text-5xl font-bold">৳{product.price.toLocaleString()}</p>
            </div>

            {/* Ratings */}
            {product.ratings?.count > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.ratings.average)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white">{product.ratings.average.toFixed(1)} Rating</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">({product.ratings.count} reviews)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold dark:text-white">Availability</span>
                {product.stock === 0 ? (
                  <span className="text-lg font-bold text-red-500">Out of Stock</span>
                ) : product.stock < 10 ? (
                  <span className="text-lg font-bold text-orange-500">Only {product.stock} left!</span>
                ) : (
                  <span className="text-lg font-bold text-green-500">In Stock ({product.stock} available)</span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <label className="block text-sm font-semibold mb-3 dark:text-white">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold dark:text-white"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold dark:text-white"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Max: {product.stock} items available
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-6 h-6" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Shipping Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div className="text-sm dark:text-gray-300">
                <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Free Shipping</p>
                <p className="text-gray-700 dark:text-gray-400">Orders over ৳5000 get free shipping. Standard delivery in 3-5 business days.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;

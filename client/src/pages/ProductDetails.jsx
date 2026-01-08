import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Package, Truck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProductDetails = () => {
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
        setProduct(response.data.product || response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product details');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const addToCart = () => {
    if (quantity <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
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
          <h1 className="text-2xl font-bold dark:text-white mb-4">Product not found</h1>
          <Link to="/marketplace" className="text-blue-500 hover:text-blue-600">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/marketplace" className="text-2xl font-bold gradient-text">
            🚗 Car Sahajjo
          </Link>
          <Link
            to="/cart"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/marketplace')}
          className="mb-6 flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </motion.button>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        >
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
              {product.isVerified && (
                <span className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Product ${idx}`}
                    className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category Badge */}
            <span className="inline-block w-fit px-4 py-2 bg-blue-500 text-white text-sm rounded-full font-semibold">
              {product.category && product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </span>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold dark:text-white mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-600 dark:text-gray-300">
                  Brand: <span className="font-semibold">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Rating */}
            {product.ratings && product.ratings.count > 0 && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
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
                <span className="dark:text-gray-300">
                  {product.ratings.average} ({product.ratings.count} reviews)
                </span>
              </div>
            )}

            {/* Price and Stock */}
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-5xl font-bold text-blue-500">
                ৳{product.price.toLocaleString()}
              </span>
              <span className={`text-lg font-semibold ${
                product.stock > 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold dark:text-white mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="dark:text-gray-300">
                      <span className="font-semibold capitalize">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="font-semibold dark:text-white">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock}
                    className="w-16 text-center px-2 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <Link
                to="/marketplace"
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-lg text-center transition-all"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm dark:text-white">Fast Delivery</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quick shipping available</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm dark:text-white">Secure Payment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Protected transactions</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Products Section */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold dark:text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct._id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700">
                    {relatedProduct.images && relatedProduct.images[0] && (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold dark:text-white mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <span className="text-lg font-bold text-blue-500">
                      ৳{relatedProduct.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

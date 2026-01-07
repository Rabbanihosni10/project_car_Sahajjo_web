import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  const seedProducts = useCallback(async () => {
    try {
      const existingRes = await api.get('/products');
      if (existingRes.data.products.length > 0) return;

      const seedData = [
        { name: 'Oil Filter', category: 'parts', price: 500, description: 'High quality oil filter for all cars', images: ['https://images.unsplash.com/photo-1628886139465-38b09603f389?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Air Filter', category: 'parts', price: 800, description: 'Engine air filter replacement', images: ['https://images.unsplash.com/photo-1608567663783-b7c06b4be7ae?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Brake Pads', category: 'parts', price: 2500, description: 'Heavy duty brake pads', images: ['https://images.unsplash.com/photo-1566833050856-e3d2a1fdf3f7?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Car Polish', category: 'fluids', price: 1200, description: 'Premium car polish and wax', images: ['https://images.unsplash.com/photo-1598711090019-7db2619c1b79?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Car Battery', category: 'electronics', price: 8000, description: '75AH Car battery', images: ['https://images.unsplash.com/photo-1610490008888-1dfdf0b36662?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Floor Mats', category: 'accessories', price: 1500, description: 'Premium rubber floor mats', images: ['https://images.unsplash.com/photo-1525116647962-f9239742facb?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Seat Covers', category: 'accessories', price: 4000, description: 'Leather seat covers set', images: ['https://images.unsplash.com/photo-1611608811528-3fe9ba9363dd?q=80&w=800&auto=format&fit=crop'] },
        { name: 'LED Lights', category: 'electronics', price: 2000, description: 'LED headlight upgrade kit', images: ['https://images.unsplash.com/photo-1565041524513-348817bed503?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Jumper Cables', category: 'tools', price: 800, description: 'Heavy duty jumper cables', images: ['https://images.unsplash.com/photo-1581091121526-c6e87f7f5d0d?q=80&w=800&auto=format&fit=crop'] },
        { name: 'Car Jack', category: 'tools', price: 3000, description: '3 ton hydraulic car jack', images: ['https://images.unsplash.com/photo-1614644147720-a909bf6250cb?q=80&w=800&auto=format&fit=crop'] },
      ];

      for (const product of seedData) {
        await api.post('/products', product);
      }
    } catch (error) {
      console.log('Products already exist or error seeding');
    }
  }, []);

  useEffect(() => {
    seedProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [seedProducts]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.log('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Added to cart!');
  };

  const categories = ['parts', 'tools', 'accessories', 'fluids', 'electronics', 'other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            🛒 Marketplace
          </Link>
          <Link
            to="/cart"
            className="relative p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white">
            Car Parts & Accessories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find quality parts and accessories for your vehicle
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  fetchProducts();
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                fetchProducts();
              }}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No products found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {product.isVerified && (
                    <span className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  <span className="absolute top-2 left-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                    {product.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Brand: {product.brand}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-500">
                      ৳{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.ratings?.count > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <span className="text-yellow-500">⭐</span>
                      <span className="dark:text-white">{product.ratings.average}</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        ({product.ratings.count} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 text-center px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Car as CarIcon, Search, Filter, Plus, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BookingRequestModal from '../components/BookingRequestModal';

const Cars = () => {
  const { isOwner, isDriver, user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    fuelType: '',
    transmission: '',
    minPrice: '',
    maxPrice: '',
    isForSale: '',
    isForRent: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [ownerView, setOwnerView] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const fetchCarsMemo = useCallback(async () => {
    try {
      setLoading(true);
      if (isOwner && ownerView) {
        const response = await api.get('/cars/my/cars');
        setCars(response.data.cars);
      } else {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
        const response = await api.get(`/cars?${params.toString()}`);
        setCars(response.data.cars);
      }
    } catch (error) {
      toast.error('Failed to fetch cars');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, isOwner, ownerView]);

  useEffect(() => {
    fetchCarsMemo();
  }, [fetchCarsMemo]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCarsMemo();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRequestBooking = (car) => {
    setSelectedCar(car);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            🚗 Car Sahajjo
          </Link>
          {isOwner && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOwnerView(!ownerView)}
                className={`px-4 py-2 rounded-lg border transition-all ${ownerView ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                {ownerView ? 'Showing: My Cars' : 'Showing: All Cars'}
              </button>
              <Link
                to="/cars/add"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Car
              </Link>
            </div>
          )}
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
            Browse Cars
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find the perfect car for sale or rent
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by brand, model, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
              <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Transmissions</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <label className="flex items-center gap-2 dark:text-white">
                <input
                  type="checkbox"
                  checked={filters.isForSale === 'true'}
                  onChange={(e) => handleFilterChange('isForSale', e.target.checked ? 'true' : '')}
                  className="w-4 h-4"
                />
                For Sale
              </label>

              <label className="flex items-center gap-2 dark:text-white">
                <input
                  type="checkbox"
                  checked={filters.isForRent === 'true'}
                  onChange={(e) => handleFilterChange('isForRent', e.target.checked ? 'true' : '')}
                  className="w-4 h-4"
                />
                For Rent
              </label>
            </motion.div>
          )}
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <CarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No cars found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <motion.div
                key={car._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {car.images && car.images[0] ? (
                    <img
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CarIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {car.isVerified && (
                    <span className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {car.isForSale && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                        For Sale
                      </span>
                    )}
                    {car.isForRent && (
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
                        For Rent
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {car.year} • {car.fuelType} • {car.transmission}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-500">
                      ৳{car.price.toLocaleString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      car.status === 'available' ? 'bg-green-100 text-green-800' :
                      car.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                      car.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {car.status}
                    </span>
                  </div>

                  {car.isForRent && car.rentalRates && (
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      <p>Hourly: ৳{car.rentalRates.hourly || 'N/A'}</p>
                      <p>Daily: ৳{car.rentalRates.daily || 'N/A'}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/cars/${car._id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                    >
                      View Details
                    </Link>
                    {isDriver && car.status === 'available' && (
                      <button
                        onClick={() => handleRequestBooking(car)}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Send size={16} />
                        Request
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BookingRequestModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedCar(null);
        }}
        car={selectedCar}
        onSuccess={fetchCarsMemo}
      />
    </div>
  );
};

export default Cars;

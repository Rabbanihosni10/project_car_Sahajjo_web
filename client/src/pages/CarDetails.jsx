import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Shield, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CarDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    rateType: 'daily',
    pickupLocation: '',
    dropLocation: '',
    notes: '',
  });
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchCarDetails = useCallback(async () => {
    try {
      const response = await api.get(`/cars/${id}`);
      setCar(response.data.car);
      if (user && response.data.car.owner._id === user.id) {
        setIsOwner(true);
      }
    } catch {
      toast.error('Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCarDetails();
  }, [fetchCarDetails]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book');
      return;
    }

    try {
      await api.post('/bookings', {
        car: id,
        ...bookingData,
      });
      toast.success('Booking request sent successfully!');
      setShowBookingModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Car not found</h2>
        <Link to="/cars" className="text-blue-500 hover:underline">
          Back to Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700">
                {car.images && car.images[0] ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl">🚗</span>
                  </div>
                )}
              </div>
            </div>

            {/* Car Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold dark:text-white mb-2">
                    {car.brand} {car.model}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {car.year} • {car.color}
                  </p>
                </div>
                <span className="text-3xl font-bold text-blue-500">
                  ৳{car.price.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fuel Type</p>
                  <p className="font-bold dark:text-white">{car.fuelType}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Transmission</p>
                  <p className="font-bold dark:text-white">{car.transmission}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Mileage</p>
                  <p className="font-bold dark:text-white">{car.mileage} km</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                  <p className="font-bold dark:text-white capitalize">{car.status}</p>
                </div>
              </div>

              {car.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">{car.description}</p>
                </div>
              )}

              {car.specifications?.features && car.specifications.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.specifications.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold dark:text-white mb-4">Owner</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {car.owner?.photo ? (
                    <img
                      src={car.owner.photo}
                      alt={car.owner.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-bold dark:text-white">{car.owner?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{car.owner?.email}</p>
                </div>
              </div>
              {car.owner?.phone && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  📞 {car.owner.phone}
                </p>
              )}
              <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                <MessageCircle className="w-4 h-4" />
                Contact Owner
              </button>
            </div>

            {/* Rental Rates */}
            {car.isForRent && car.rentalRates && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold dark:text-white mb-4">Rental Rates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Hourly:</span>
                    <span className="font-bold dark:text-white">৳{car.rentalRates.hourly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Daily:</span>
                    <span className="font-bold dark:text-white">৳{car.rentalRates.daily}</span>
                  </div>
                </div>
                {car.status === 'available' && !isOwner && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </button>
                )}
                {isOwner && (
                  <div className="w-full mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg text-center text-gray-600 dark:text-gray-300 font-semibold">
                    You are the owner
                  </div>
                )}
              </div>
            )}

            {/* Documents Status */}
            {car.documents && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Documents
                </h3>
                <div className="space-y-2 text-sm">
                  {car.documents.rc && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">RC:</span>
                      <span className="text-green-500">✓ Available</span>
                    </div>
                  )}
                  {car.documents.insurance && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Insurance:</span>
                      <span className="text-green-500">✓ Available</span>
                    </div>
                  )}
                  {car.isVerified && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-green-800 dark:text-green-200 text-center">
                      ✓ Verified by Admin
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold dark:text-white mb-4">Book This Car</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.startDate}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Rate Type
                </label>
                <select
                  value={bookingData.rateType}
                  onChange={(e) => setBookingData({ ...bookingData, rateType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.pickupLocation}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, pickupLocation: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Drop Location
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.dropLocation}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, dropLocation: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CarDetails;

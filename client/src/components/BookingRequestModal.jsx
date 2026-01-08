import { useState } from 'react';
import { X, Send, Calendar, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BookingRequestModal = ({ isOpen, onClose, car, onSuccess }) => {
  const [formData, setFormData] = useState({
    bookingType: 'rent',
    startDate: '',
    endDate: '',
    rateType: 'daily',
    driverMessage: '',
    pickupLocation: '',
    dropLocation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmount = () => {
    if (!car) return 0;
    
    if (formData.bookingType === 'buy') {
      return car.price;
    }

    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = (end - start) / (1000 * 60 * 60);

    if (formData.rateType === 'hourly') {
      return duration * (car.rentalRates?.hourly || 0);
    } else {
      const days = Math.ceil(duration / 24);
      return days * (car.rentalRates?.daily || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.bookingType === 'rent' && (!formData.startDate || !formData.endDate)) {
      toast.error('Please select start and end dates for rental');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/bookings/request',
        {
          carId: car._id,
          ...formData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Booking request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !car) return null;

  const totalAmount = calculateAmount();
  const securityDeposit = formData.bookingType === 'rent' ? totalAmount * 0.2 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Booking
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {car.brand} {car.model} ({car.year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Booking Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="rent"
                  checked={formData.bookingType === 'rent'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="dark:text-white">Rent</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bookingType"
                  value="buy"
                  checked={formData.bookingType === 'buy'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="dark:text-white">Buy</span>
              </label>
            </div>
          </div>

          {/* Rental Details - Show only for rent */}
          {formData.bookingType === 'rent' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required={formData.bookingType === 'rent'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required={formData.bookingType === 'rent'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rate Type
                </label>
                <select
                  name="rateType"
                  value={formData.rateType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="hourly">Hourly (৳{car.rentalRates?.hourly || 0}/hr)</option>
                  <option value="daily">Daily (৳{car.rentalRates?.daily || 0}/day)</option>
                </select>
              </div>
            </>
          )}

          {/* Locations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Pickup Location
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Where will you pick up the car?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Drop Location
            </label>
            <input
              type="text"
              name="dropLocation"
              value={formData.dropLocation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Where will you return the car?"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message to Owner
            </label>
            <textarea
              name="driverMessage"
              value={formData.driverMessage}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Tell the owner why you want this car..."
            />
          </div>

          {/* Price Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              Price Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {formData.bookingType === 'buy' ? 'Purchase Price' : 'Rental Amount'}:
                </span>
                <span className="font-semibold dark:text-white">৳{totalAmount.toFixed(2)}</span>
              </div>
              {formData.bookingType === 'rent' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Security Deposit (20%):</span>
                  <span className="font-semibold dark:text-white">৳{securityDeposit.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-900 dark:text-white font-bold">Total:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  ৳{(totalAmount + securityDeposit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <Send size={18} />
              <span>{loading ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingRequestModal;

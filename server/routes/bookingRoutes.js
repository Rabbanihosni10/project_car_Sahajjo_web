const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  requestBooking,
  getOwnerBookingRequests,
  getOwnerAllBookings,
  approveBooking,
  rejectBooking,
  getDriverBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

// Driver routes
router.post('/request', protect, authorize('driver'), requestBooking);
router.get('/driver/my', protect, authorize('driver'), getDriverBookings);

// Owner routes
router.get('/owner/requests', protect, authorize('car_owner'), getOwnerBookingRequests);
router.get('/owner/all', protect, authorize('car_owner'), getOwnerAllBookings);
router.put('/:id/approve', protect, authorize('car_owner'), approveBooking);
router.put('/:id/reject', protect, authorize('car_owner'), rejectBooking);

// Existing routes
router.post('/', protect, createBooking);
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/my/bookings', protect, getMyBookings);
router.get('/my/received', protect, authorize('car_owner', 'admin'), getReceivedBookings);
router.get('/check-availability/:carId', checkAvailability);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

module.exports = router;

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
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, createBooking);
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/my/bookings', protect, getMyBookings);
router.get('/my/received', protect, authorize('owner', 'admin'), getReceivedBookings);
router.get('/check-availability/:carId', checkAvailability);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

module.exports = router;

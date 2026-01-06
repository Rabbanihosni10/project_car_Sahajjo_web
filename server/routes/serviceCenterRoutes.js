const express = require('express');
const router = express.Router();
const {
  createServiceCenter,
  getAllServiceCenters,
  getServiceCenterById,
  updateServiceCenter,
  deleteServiceCenter,
  bookService,
  updateBookingStatus,
  getMyServiceBookings,
  getNearbyServiceCenters,
} = require('../controllers/serviceCenterController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('admin'), createServiceCenter);
router.get('/', getAllServiceCenters);
router.get('/nearby', getNearbyServiceCenters);
router.get('/my/bookings', protect, getMyServiceBookings);
router.get('/:id', getServiceCenterById);
router.put('/:id', protect, authorize('admin'), updateServiceCenter);
router.delete('/:id', protect, authorize('admin'), deleteServiceCenter);
router.post('/:id/book', protect, bookService);
router.put('/:id/bookings/:bookingId', protect, authorize('admin'), updateBookingStatus);

module.exports = router;

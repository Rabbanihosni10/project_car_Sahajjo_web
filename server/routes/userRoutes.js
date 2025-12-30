const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateKYC,
  approveUser,
  deleteUser,
  updateLocation,
  getDriverLocations,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/drivers/locations', getDriverLocations);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/kyc', protect, updateKYC);
router.put('/location', protect, updateLocation);
router.put('/:id/approve', protect, authorize('admin'), approveUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllGarages,
  getGarageById,
  submitGarage,
  createGarage,
  getPendingGarages,
  approveGarage,
  rejectGarage,
  updateGarage,
  deleteGarage,
  getMySubmissions,
} = require('../controllers/garageController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllGarages);
router.get('/:id', getGarageById);

// Protected routes (any authenticated user)
router.post('/submit', protect, submitGarage);
router.get('/user/my-submissions', protect, getMySubmissions);

// Admin only routes
router.post('/', protect, admin, createGarage);
router.get('/admin/pending', protect, admin, getPendingGarages);
router.put('/:id/approve', protect, admin, approveGarage);
router.put('/:id/reject', protect, admin, rejectGarage);
router.put('/:id', protect, admin, updateGarage);
router.delete('/:id', protect, admin, deleteGarage);

module.exports = router;

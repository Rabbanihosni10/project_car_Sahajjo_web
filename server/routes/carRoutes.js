const express = require('express');
const router = express.Router();
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars,
  updateCarDocuments,
  verifyCar,
} = require('../controllers/carController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('owner', 'admin'), createCar);
router.get('/', getAllCars);
router.get('/my/cars', protect, authorize('owner', 'admin'), getMyCars);
router.get('/:id', getCarById);
router.put('/:id', protect, updateCar);
router.delete('/:id', protect, deleteCar);
router.put('/:id/documents', protect, updateCarDocuments);
router.put('/:id/verify', protect, authorize('admin'), verifyCar);

module.exports = router;

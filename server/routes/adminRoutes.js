const express = require('express');
const router = express.Router();
const { getCollections } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// Admin DB utilities
router.get('/collections', protect, authorize('admin'), getCollections);

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, getMe, logoutAll, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout-all', protect, logoutAll);
router.post('/verify-otp', verifyOtp);
// Resend OTP removed: SMTP not in use

module.exports = router;

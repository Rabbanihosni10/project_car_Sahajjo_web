const User = require('../models/User');
const jwt = require('jsonwebtoken');
// SMTP/Email sending removed; 2FA via email disabled

const JWT_SECRET = process.env.JWT_SECRET || 'carsahajjo_secret_key_2025';
const JWT_EXPIRE = '30d';

// Generate JWT Token with tokenVersion support
const generateToken = (user) => {
  return jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'owner',
      isApproved: role === 'admin' ? true : false,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2FA via email disabled: issue token directly for all users

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        photo: user.photo,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP for 2FA and issue JWT
// @route   POST /api/auth/verify-otp
// @access  Public (provided email)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({ message: 'No active OTP. Please login again.' });
    }
    if (new Date() > user.twoFactorExpires) {
      user.twoFactorCode = undefined;
      user.twoFactorExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please login again.' });
    }
    // Track attempt and lock after too many tries
    user.otpAttemptCount = (user.otpAttemptCount || 0) + 1;
    if (user.otpAttemptCount > 5) {
      user.twoFactorCode = undefined;
      user.twoFactorExpires = undefined;
      await user.save();
      return res.status(429).json({ message: 'Too many attempts. Please login again.' });
    }
    if (user.twoFactorCode !== code) {
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Clear OTP and issue token
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    user.lastOtpSentAt = undefined;
    user.otpAttemptCount = 0;
    await user.save();

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('VerifyOtp Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification', error: error.message });
  }
};

// Resend OTP removed: SMTP not in use

// @desc    Logout from all devices (invalidate all tokens)
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    console.error('LogoutAll Error:', error);
    res.status(500).json({ message: 'Server error during logout-all', error: error.message });
  }
};

// @desc    Seed Super Admin on Server Startup
// @route   N/A (Called internally)
// @access  Internal
exports.seedSuperAdmin = async () => {
  try {
    const adminEmail = 'rabbanihosni10@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: '123456',
        role: 'admin',
        isVerified: true,
        isApproved: true,
      });
      console.log('✅ Super Admin created: rabbanihosni10@gmail.com / 123456');
    } else {
      // Ensure existing admin uses the requested credentials
      adminExists.password = '123456';
      await adminExists.save();
      console.log('✅ Super Admin updated: rabbanihosni10@gmail.com / 123456');
    }
  } catch (error) {
    console.error('❌ Error seeding super admin:', error.message);
  }
};

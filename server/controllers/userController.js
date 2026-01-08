const User = require('../models/User');
const { sendNotification } = require('./notificationController');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address, photo, licenseInfo, location } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (photo) user.photo = photo;
    if (licenseInfo) user.licenseInfo = { ...user.licenseInfo, ...licenseInfo };
    if (location) user.location = { ...user.location, ...location, lastUpdated: Date.now() };

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update KYC documents
// @route   PUT /api/users/kyc
// @access  Private
exports.updateKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { idType, idNumber, idPhoto } = req.body;

    user.kycDocuments = {
      idType,
      idNumber,
      idPhoto,
      verificationStatus: 'pending',
    };

    await user.save();

    res.json({
      success: true,
      message: 'KYC documents submitted for verification',
      kycDocuments: user.kycDocuments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve/Reject user (Admin only)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const { isApproved, kycStatus } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof isApproved !== 'undefined') {
      user.isApproved = isApproved;
    }

    if (kycStatus) {
      user.kycDocuments.verificationStatus = kycStatus;
    }

    await user.save();

    if (typeof isApproved !== 'undefined') {
      const approvalMessage = isApproved
        ? 'Your account has been approved. You can now access all features.'
        : 'Your account approval has been revoked. Please contact support if this is unexpected.';
      await sendNotification(user._id, 'Account Status Update', approvalMessage, 'user', user._id, 'User');
    }

    if (kycStatus) {
      const kycMessage = kycStatus === 'approved'
        ? 'Your KYC documents have been verified.'
        : `Your KYC status was updated to ${kycStatus}.`;
      await sendNotification(user._id, 'KYC Update', kycMessage, 'user', user._id, 'User');
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        kycDocuments: user.kycDocuments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user location (for GPS tracking)
// @route   PUT /api/users/location
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location = {
      latitude,
      longitude,
      lastUpdated: Date.now(),
    };

    await user.save();

    res.json({
      success: true,
      location: user.location,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get drivers with live locations
// @route   GET /api/users/drivers/locations
// @access  Public
exports.getDriverLocations = async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      isApproved: true,
    }).select('name photo location');

    res.json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

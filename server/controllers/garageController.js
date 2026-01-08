const Garage = require('../models/Garage');
const { sendNotification } = require('./notificationController');

// @desc    Get all approved garages
// @route   GET /api/garages
// @access  Public
exports.getAllGarages = async (req, res) => {
  try {
    const garages = await Garage.find({ status: 'approved' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, garages });
  } catch (error) {
    console.error('Get garages error:', error);
    res.status(500).json({ message: 'Failed to fetch garages', error: error.message });
  }
};

// @desc    Get garage by ID
// @route   GET /api/garages/:id
// @access  Public
exports.getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }
    
    res.json({ success: true, garage });
  } catch (error) {
    console.error('Get garage error:', error);
    res.status(500).json({ message: 'Failed to fetch garage', error: error.message });
  }
};

// @desc    Submit a new garage (for approval)
// @route   POST /api/garages/submit
// @access  Private (any authenticated user)
exports.submitGarage = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      services,
      website,
      email,
      openingHours,
      description,
    } = req.body;

    // Validation
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Please provide name, address, latitude, and longitude' 
      });
    }

    // Create garage submission
    const garage = await Garage.create({
      name,
      address,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      phone,
      services: services || [],
      website,
      email,
      openingHours,
      description,
      submittedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ 
      success: true, 
      message: 'Garage submitted for approval', 
      garage 
    });
  } catch (error) {
    console.error('Submit garage error:', error);
    res.status(500).json({ message: 'Failed to submit garage', error: error.message });
  }
};

// @desc    Create a new garage directly (Admin only)
// @route   POST /api/garages
// @access  Private/Admin
exports.createGarage = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      services,
      rating,
      isOpen,
      website,
      email,
      openingHours,
      description,
    } = req.body;

    // Validation
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Please provide name, address, latitude, and longitude' 
      });
    }

    // Create garage (auto-approved since created by admin)
    const garage = await Garage.create({
      name,
      address,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      phone,
      services: services || [],
      rating: rating || 0,
      isOpen: isOpen !== undefined ? isOpen : true,
      website,
      email,
      openingHours,
      description,
      submittedBy: req.user._id,
      approvedBy: req.user._id,
      status: 'approved',
      isVerified: true,
      approvedAt: new Date(),
    });

    res.status(201).json({ 
      success: true, 
      message: 'Garage created successfully', 
      garage 
    });
  } catch (error) {
    console.error('Create garage error:', error);
    res.status(500).json({ message: 'Failed to create garage', error: error.message });
  }
};

// @desc    Get all pending garage submissions
// @route   GET /api/garages/pending
// @access  Private/Admin
exports.getPendingGarages = async (req, res) => {
  try {
    const garages = await Garage.find({ status: 'pending' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, garages });
  } catch (error) {
    console.error('Get pending garages error:', error);
    res.status(500).json({ message: 'Failed to fetch pending garages', error: error.message });
  }
};

// @desc    Approve a garage submission
// @route   PUT /api/garages/:id/approve
// @access  Private/Admin
exports.approveGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }

    garage.status = 'approved';
    garage.isVerified = true;
    garage.approvedBy = req.user._id;
    garage.approvedAt = new Date();

    await garage.save();

    // Send notification to the person who submitted the garage
    await sendNotification(
      garage.submittedBy,
      'Garage Approved',
      `Your garage "${garage.name}" has been approved and is now visible on the map.`,
      'garage',
      garage._id,
      'Garage'
    );

    res.json({ 
      success: true, 
      message: 'Garage approved successfully', 
      garage 
    });
  } catch (error) {
    console.error('Approve garage error:', error);
    res.status(500).json({ message: 'Failed to approve garage', error: error.message });
  }
};

// @desc    Reject a garage submission
// @route   PUT /api/garages/:id/reject
// @access  Private/Admin
exports.rejectGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }

    garage.status = 'rejected';
    await garage.save();

    // Send notification to the person who submitted the garage
    await sendNotification(
      garage.submittedBy,
      'Garage Submission Rejected',
      `Your garage submission "${garage.name}" was not approved. Please review and resubmit.`,
      'garage',
      garage._id,
      'Garage'
    );

    res.json({ 
      success: true, 
      message: 'Garage rejected', 
      garage 
    });
  } catch (error) {
    console.error('Reject garage error:', error);
    res.status(500).json({ message: 'Failed to reject garage', error: error.message });
  }
};

// @desc    Update a garage
// @route   PUT /api/garages/:id
// @access  Private/Admin
exports.updateGarage = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      services,
      rating,
      isOpen,
      website,
      email,
      openingHours,
      description,
    } = req.body;

    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }

    // Update fields
    if (name) garage.name = name;
    if (address) garage.address = address;
    if (latitude) garage.location.latitude = parseFloat(latitude);
    if (longitude) garage.location.longitude = parseFloat(longitude);
    if (phone !== undefined) garage.phone = phone;
    if (services) garage.services = services;
    if (rating !== undefined) garage.rating = rating;
    if (isOpen !== undefined) garage.isOpen = isOpen;
    if (website !== undefined) garage.website = website;
    if (email !== undefined) garage.email = email;
    if (openingHours !== undefined) garage.openingHours = openingHours;
    if (description !== undefined) garage.description = description;

    await garage.save();

    res.json({ 
      success: true, 
      message: 'Garage updated successfully', 
      garage 
    });
  } catch (error) {
    console.error('Update garage error:', error);
    res.status(500).json({ message: 'Failed to update garage', error: error.message });
  }
};

// @desc    Delete a garage
// @route   DELETE /api/garages/:id
// @access  Private/Admin
exports.deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }

    await garage.deleteOne();

    res.json({ 
      success: true, 
      message: 'Garage deleted successfully' 
    });
  } catch (error) {
    console.error('Delete garage error:', error);
    res.status(500).json({ message: 'Failed to delete garage', error: error.message });
  }
};

// @desc    Get user's submitted garages
// @route   GET /api/garages/my-submissions
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const garages = await Garage.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, garages });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};

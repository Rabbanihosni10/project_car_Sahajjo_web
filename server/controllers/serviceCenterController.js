const ServiceCenter = require('../models/ServiceCenter');

// @desc    Create a new service center
// @route   POST /api/service-centers
// @access  Private (Admin only)
exports.createServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.create(req.body);
    res.status(201).json({ success: true, serviceCenter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all service centers
// @route   GET /api/service-centers
// @access  Public
exports.getAllServiceCenters = async (req, res) => {
  try {
    const { search, service } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
    }

    if (service) {
      query.services = new RegExp(service, 'i');
    }

    const serviceCenters = await ServiceCenter.find(query).sort({ 'ratings.average': -1 });

    res.json({ success: true, count: serviceCenters.length, serviceCenters });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get service center by ID
// @route   GET /api/service-centers/:id
// @access  Public
exports.getServiceCenterById = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findById(req.params.id).populate(
      'bookings.user',
      'name email phone'
    );

    if (!serviceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    res.json({ success: true, serviceCenter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update service center
// @route   PUT /api/service-centers/:id
// @access  Private (Admin only)
exports.updateServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!serviceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    res.json({ success: true, serviceCenter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete service center
// @route   DELETE /api/service-centers/:id
// @access  Private (Admin only)
exports.deleteServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByIdAndDelete(req.params.id);

    if (!serviceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    res.json({ success: true, message: 'Service center deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Book a service
// @route   POST /api/service-centers/:id/book
// @access  Private
exports.bookService = async (req, res) => {
  try {
    const { date, service } = req.body;
    const serviceCenter = await ServiceCenter.findById(req.params.id);

    if (!serviceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    serviceCenter.bookings.push({
      user: req.user.id,
      date,
      service,
      status: 'pending',
    });

    await serviceCenter.save();

    res.json({ success: true, message: 'Service booked successfully', serviceCenter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/service-centers/:id/bookings/:bookingId
// @access  Private (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const serviceCenter = await ServiceCenter.findById(req.params.id);

    if (!serviceCenter) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    const booking = serviceCenter.bookings.id(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await serviceCenter.save();

    res.json({ success: true, serviceCenter });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my service bookings
// @route   GET /api/service-centers/my/bookings
// @access  Private
exports.getMyServiceBookings = async (req, res) => {
  try {
    const serviceCenters = await ServiceCenter.find({
      'bookings.user': req.user.id,
    });

    const myBookings = [];
    serviceCenters.forEach(center => {
      center.bookings.forEach(booking => {
        if (booking.user.toString() === req.user.id) {
          myBookings.push({
            ...booking.toObject(),
            serviceCenter: {
              id: center._id,
              name: center.name,
              location: center.location,
              phone: center.phone,
            },
          });
        }
      });
    });

    res.json({ success: true, count: myBookings.length, bookings: myBookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby service centers
// @route   GET /api/service-centers/nearby
// @access  Public
exports.getNearbyServiceCenters = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const serviceCenters = await ServiceCenter.find();

    // Simple distance calculation (can be improved with geospatial queries)
    const nearby = serviceCenters.filter(center => {
      const distance = getDistanceFromLatLonInKm(
        parseFloat(lat),
        parseFloat(lng),
        center.location.latitude,
        center.location.longitude
      );
      return distance <= radius;
    });

    res.json({ success: true, count: nearby.length, serviceCenters: nearby });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to calculate distance between two points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

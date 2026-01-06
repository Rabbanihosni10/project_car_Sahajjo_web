const Booking = require('../models/Booking');
const Car = require('../models/Car');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { car, startDate, endDate, rateType, pickupLocation, dropLocation, notes } = req.body;

    // Check if car exists and is available
    const carData = await Car.findById(car);
    if (!carData) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (carData.status !== 'available') {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      car: car,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ message: 'Car is already booked for these dates' });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = (end - start) / (1000 * 60 * 60); // hours

    let totalAmount;
    if (rateType === 'hourly') {
      totalAmount = duration * carData.rentalRates.hourly;
    } else {
      const days = Math.ceil(duration / 24);
      totalAmount = days * carData.rentalRates.daily;
    }

    const booking = await Booking.create({
      car,
      renter: req.user.id,
      startDate,
      endDate,
      rateType,
      totalAmount,
      securityDeposit: totalAmount * 0.2, // 20% security deposit
      pickupLocation,
      dropLocation,
      notes,
    });

    await booking.populate('car renter');

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car', 'brand model year images')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('renter', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('car', 'brand model year images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings for my cars
// @route   GET /api/bookings/my/received
// @access  Private (Owner only)
exports.getReceivedBookings = async (req, res) => {
  try {
    const Car = require('../models/Car');
    const myCars = await Car.find({ owner: req.user.id });
    const carIds = myCars.map(car => car._id);

    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate('car', 'brand model year images')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isOwner = booking.car.owner.toString() === req.user.id;
    const isRenter = booking.renter.toString() === req.user.id;

    if (!isOwner && !isRenter && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Update car status if booking is active or completed
    if (status === 'active') {
      await Car.findByIdAndUpdate(booking.car._id, { status: 'rented' });
    } else if (status === 'completed' || status === 'cancelled') {
      await Car.findByIdAndUpdate(booking.car._id, { status: 'available' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.renter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get car availability
// @route   GET /api/bookings/check-availability/:carId
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { carId } = req.params;
    const { startDate, endDate } = req.query;

    const bookings = await Booking.find({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    res.json({
      success: true,
      available: bookings.length === 0,
      conflictingBookings: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

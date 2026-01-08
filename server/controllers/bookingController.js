const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { sendNotification } = require('./notificationController');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    // Admins cannot book cars
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot book cars' });
    }

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
      renter: req.user._id,
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

    // Notify car owner about new booking
    await sendNotification(
      carData.owner,
      'New Booking Request',
      `${req.user.name} has requested to book your ${carData.brand} ${carData.model}`,
      'booking',
      booking._id,
      'Booking'
    );

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
    const bookings = await Booking.find({ renter: req.user._id })
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
    const myCars = await Car.find({ owner: req.user._id });
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
    const isOwner = booking.car.owner.toString() === req.user._id.toString();
    const isRenter = booking.renter.toString() === req.user._id.toString();

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

    // Notify renter about booking status change
    const statusMessages = {
      confirmed: 'Your booking has been confirmed!',
      active: 'Your booking is now active!',
      completed: 'Your booking has been completed!',
      cancelled: 'Your booking has been cancelled',
      rejected: 'Your booking has been rejected'
    };
    
    if (statusMessages[status]) {
      await sendNotification(
        booking.renter,
        'Booking Status Updated',
        statusMessages[status],
        'booking',
        booking._id,
        'Booking'
      );
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

    if (booking.renter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
      status: { $in: ['pending', 'approved', 'active'] },
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

// @desc    Request car booking (Driver)
// @route   POST /api/bookings/request
// @access  Private (Driver only)
exports.requestBooking = async (req, res) => {
  try {
    const { carId, bookingType, startDate, endDate, rateType, driverMessage, pickupLocation, dropLocation } = req.body;

    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can request bookings' });
    }

    const car = await Car.findById(carId).populate('owner');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.status !== 'available') {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    // Calculate total amount
    let totalAmount;
    if (bookingType === 'buy') {
      totalAmount = car.price;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = (end - start) / (1000 * 60 * 60);

      if (rateType === 'hourly') {
        totalAmount = duration * car.rentalRates.hourly;
      } else {
        const days = Math.ceil(duration / 24);
        totalAmount = days * car.rentalRates.daily;
      }
    }

    const booking = await Booking.create({
      car: carId,
      owner: car.owner._id,
      renter: req.user._id,
      bookingType,
      startDate: bookingType === 'rent' ? startDate : undefined,
      endDate: bookingType === 'rent' ? endDate : undefined,
      rateType: bookingType === 'rent' ? rateType : 'one-time',
      totalAmount,
      securityDeposit: bookingType === 'rent' ? totalAmount * 0.2 : 0,
      pickupLocation,
      dropLocation,
      driverMessage,
      status: 'pending',
    });

    await booking.populate('car renter owner');

    // Notify car owner
    await sendNotification({
      userId: car.owner._id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${req.user.name} wants to ${bookingType} your ${car.brand} ${car.model}`,
      link: `/bookings/requests`
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully. Waiting for owner approval.',
      booking
    });
  } catch (error) {
    console.error('Request booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking requests for owner
// @route   GET /api/bookings/owner/requests
// @access  Private (Car Owner only)
exports.getOwnerBookingRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({
      owner: req.user._id,
      status: 'pending'
    })
      .populate('car', 'brand model year images price rentalRates listingType')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings for owner (approved/rejected/all)
// @route   GET /api/bookings/owner/all
// @access  Private (Car Owner only)
exports.getOwnerAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { owner: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('car', 'brand model year images price rentalRates listingType')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      rented: bookings.filter(b => b.bookingType === 'rent' && ['approved', 'active', 'completed'].includes(b.status)).length,
      sold: bookings.filter(b => b.bookingType === 'buy' && ['approved', 'completed'].includes(b.status)).length,
    };

    res.json({ success: true, stats, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve booking request
// @route   PUT /api/bookings/:id/approve
// @access  Private (Car Owner only)
exports.approveBooking = async (req, res) => {
  try {
    const { ownerResponse } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('renter', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in pending status' });
    }

    booking.status = 'approved';
    booking.approvedAt = Date.now();
    booking.ownerResponse = ownerResponse;
    await booking.save();

    // Notify driver
    await sendNotification({
      userId: booking.renter._id,
      type: 'booking_approved',
      title: 'Booking Approved!',
      message: `Your request to ${booking.bookingType} ${booking.car.brand} ${booking.car.model} has been approved!`,
      link: `/bookings/my`
    });

    res.json({
      success: true,
      message: 'Booking approved successfully',
      booking
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Car Owner only)
exports.rejectBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('renter', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in pending status' });
    }

    booking.status = 'rejected';
    booking.rejectedAt = Date.now();
    booking.rejectionReason = rejectionReason;
    await booking.save();

    // Notify driver
    await sendNotification({
      userId: booking.renter._id,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your request to ${booking.bookingType} ${booking.car.brand} ${booking.car.model} was rejected: ${rejectionReason}`,
      link: `/bookings/my`
    });

    res.json({
      success: true,
      message: 'Booking rejected',
      booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get driver's bookings
// @route   GET /api/bookings/driver/my
// @access  Private (Driver only)
exports.getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate('car', 'brand model year images price rentalRates listingType')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };

    res.json({ success: true, stats, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Car = require('../models/Car');

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private (Owner only)
exports.createCar = async (req, res) => {
  try {
    // Admins cannot create cars
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot create cars' });
    }
    console.log('Creating car for user:', req.user._id);
    
    const carData = {
      ...req.body,
      owner: req.user._id,
    };

    const car = await Car.create(carData);
    console.log('Car created successfully:', car._id);
    
    res.status(201).json({ success: true, message: 'Car added successfully', car });
  } catch (error) {
    console.error('Create Car Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
exports.getAllCars = async (req, res) => {
  try {
    const {
      brand,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      status,
      isForSale,
      isForRent,
      search,
    } = req.query;

    let query = {};

    if (brand) query.brand = new RegExp(brand, 'i');
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (status) query.status = status;
    if (isForSale !== undefined) query.isForSale = isForSale === 'true';
    if (isForRent !== undefined) query.isForRent = isForRent === 'true';
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const cars = await Car.find(query)
      .populate('owner', 'name email phone photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: cars.length, cars });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email phone photo address');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private (Owner only)
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check ownership
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private (Owner only)
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check ownership
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my cars
// @route   GET /api/cars/my/cars
// @access  Private (Owner only)
exports.getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: cars.length, cars });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update car documents
// @route   PUT /api/cars/:id/documents
// @access  Private (Owner only)
exports.updateCarDocuments = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    car.documents = { ...car.documents, ...req.body };
    await car.save();

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify car (Admin only)
// @route   PUT /api/cars/:id/verify
// @access  Private (Admin only)
exports.verifyCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

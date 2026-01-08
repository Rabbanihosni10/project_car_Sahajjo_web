#!/usr/bin/env node
/**
 * Comprehensive Data Seeding Script for Car Sahajjo
 * Adds extensive data to MongoDB Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import models
const User = require(path.join(__dirname, 'models/User'));
const Car = require(path.join(__dirname, 'models/Car'));
const Product = require(path.join(__dirname, 'models/Product'));
const Garage = require(path.join(__dirname, 'models/Garage'));
const ServiceCenter = require(path.join(__dirname, 'models/ServiceCenter'));
const Job = require(path.join(__dirname, 'models/Job'));
const Review = require(path.join(__dirname, 'models/Review'));
const Forum = require(path.join(__dirname, 'models/Forum'));
const Booking = require(path.join(__dirname, 'models/Booking'));

const MONGO_URI = process.env.MONGO_URI;

console.log('═══════════════════════════════════════════════════════');
console.log('   🌱 Car Sahajjo - Comprehensive Data Seeding');
console.log('═══════════════════════════════════════════════════════\n');

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ Connected to MongoDB Atlas\n');

    // Get existing counts
    console.log('📊 Current database state:');
    const existingCounts = {
      users: await User.countDocuments(),
      cars: await Car.countDocuments(),
      products: await Product.countDocuments(),
      garages: await Garage.countDocuments(),
      serviceCenters: await ServiceCenter.countDocuments(),
      jobs: await Job.countDocuments(),
      reviews: await Review.countDocuments(),
      forums: await Forum.countDocuments(),
      bookings: await Booking.countDocuments()
    };
    console.log(`   Users: ${existingCounts.users}`);
    console.log(`   Cars: ${existingCounts.cars}`);
    console.log(`   Products: ${existingCounts.products}`);
    console.log(`   Garages: ${existingCounts.garages}`);
    console.log(`   Service Centers: ${existingCounts.serviceCenters}`);
    console.log(`   Jobs: ${existingCounts.jobs}`);
    console.log(`   Reviews: ${existingCounts.reviews}`);
    console.log(`   Forum Posts: ${existingCounts.forums}`);
    console.log(`   Bookings: ${existingCounts.bookings}\n`);

    console.log('➕ Appending new data...\n');

    // ============ USERS ============
    console.log('👥 Creating Users...');
    
    // Check existing admin user
    const existingAdmin = await User.findOne({ email: 'admin@carsahajjo.com' });
    let adminUser;
    
    if (existingAdmin) {
      console.log('   ℹ️  Admin user already exists, skipping...');
      adminUser = existingAdmin;
    } else {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@carsahajjo.com',
        phone: '01700000001',
        password: 'admin123',
        role: 'admin',
        photo: 'https://via.placeholder.com/150',
        address: 'Dhaka, Bangladesh',
        isVerified: true,
        isApproved: true
      });
    }

    // Get current user count to generate unique emails
    const userCount = await User.countDocuments();
    
    // Create new drivers with unique emails
    const newDrivers = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        const email = `driver${userCount + i + 1}@example.com`;
        return await User.create({
          name: `Driver ${userCount + i + 1}`,
          email: email,
          phone: `0171${2000000 + userCount + i}`,
          password: 'pass123',
          role: 'driver',
          photo: 'https://via.placeholder.com/150?text=Driver',
          address: `Dhaka, Bangladesh`,
          isVerified: true,
          isApproved: true,
          licenseInfo: { licenseNumber: `DL-2026-${String(userCount + i + 1).padStart(3, '0')}` }
        });
      })
    );
    
    // Create new owners with unique emails
    const newOwners = await Promise.all(
      Array.from({ length: 4 }, async (_, i) => {
        const email = `owner${userCount + i + 6}@example.com`;
        return await User.create({
          name: `Car Owner ${userCount + i + 6}`,
          email: email,
          phone: `0175${6000000 + userCount + i}`,
          password: 'pass123',
          role: 'owner',
          photo: 'https://via.placeholder.com/150?text=Owner',
          address: `Dhaka, Bangladesh`,
          isVerified: true,
          isApproved: true
        });
      })
    );
    
    const users = [adminUser, ...newDrivers, ...newOwners];
    console.log(`✅ Created ${users.length} users\n`);

    // ============ CARS ============
    console.log('🚗 Creating Cars for Rental...');
    const carBrands = [
      { brand: 'Toyota', model: 'Prius', year: 2024, fuelType: 'hybrid', transmission: 'automatic' },
      { brand: 'Honda', model: 'Civic', year: 2023, fuelType: 'petrol', transmission: 'manual' },
      { brand: 'Hyundai', model: 'Creta', year: 2024, fuelType: 'diesel', transmission: 'automatic' },
      { brand: 'Nissan', model: 'Sunny', year: 2022, fuelType: 'petrol', transmission: 'manual' },
      { brand: 'Suzuki', model: 'Swift', year: 2024, fuelType: 'petrol', transmission: 'automatic' },
      { brand: 'Toyota', model: 'Corolla', year: 2023, fuelType: 'petrol', transmission: 'manual' },
      { brand: 'Mazda', model: 'CX-5', year: 2023, fuelType: 'diesel', transmission: 'automatic' },
      { brand: 'BMW', model: '3 Series', year: 2024, fuelType: 'petrol', transmission: 'automatic' },
      { brand: 'Mercedes', model: 'C-Class', year: 2023, fuelType: 'diesel', transmission: 'automatic' },
      { brand: 'Volkswagen', model: 'Jetta', year: 2022, fuelType: 'petrol', transmission: 'manual' }
    ];

    const cars = await Car.insertMany(carBrands.map((car, idx) => ({
      owner: users[6 + (idx % 4)]._id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: 2000 + idx * 500,
      mileage: Math.random() * 15000,
      fuelType: car.fuelType,
      transmission: car.transmission,
      color: ['Silver', 'Blue', 'Black', 'White', 'Red'][idx % 5],
      description: `${car.brand} ${car.model} - Available for rent`,
      images: [`https://via.placeholder.com/400?text=${car.brand}+${car.model}`],
      status: 'available',
      isForRent: true,
      rentalRates: {
        hourly: 2000 + idx * 500,
        daily: 16000 + idx * 4000
      },
      specifications: {
        seats: 5,
        engineCC: 1200 + idx * 100,
        features: ['AC', 'Power Windows', 'ABS', 'Airbags', 'Bluetooth']
      }
    })));
    console.log(`✅ Created ${cars.length} cars\n`);

    // ============ MARKETPLACE PRODUCTS ============
    console.log('🛒 Creating Marketplace Products...');
    const productCategories = [
      { name: 'Premium Car Seat Covers', category: 'accessories', price: 2500 },
      { name: 'Car Floor Mats Set', category: 'accessories', price: 1200 },
      { name: 'Dashboard Anti-Slip Pad', category: 'accessories', price: 450 },
      { name: 'Car Battery 12V 60Ah', category: 'parts', price: 6500 },
      { name: 'Engine Oil 5L Synthetic', category: 'fluids', price: 2200 },
      { name: 'Air Filter Replacement', category: 'parts', price: 800 },
      { name: 'Car Wash Shampoo 2L', category: 'fluids', price: 450 },
      { name: 'Tire Pressure Gauge', category: 'tools', price: 350 },
      { name: 'Brake Pads Front Set', category: 'parts', price: 3500 },
      { name: 'Car Wax Polish 500ml', category: 'fluids', price: 1200 },
      { name: 'Car Phone Mount', category: 'accessories', price: 650 },
      { name: 'Dual USB Car Charger', category: 'electronics', price: 450 },
      { name: 'Dash Cam Full HD 1080P', category: 'electronics', price: 5500 },
      { name: 'Safety Reflective Vest', category: 'accessories', price: 250 },
      { name: 'First Aid Kit Car', category: 'other', price: 1500 }
    ];

    const products = await Product.insertMany(productCategories.map((prod, idx) => ({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      description: `High quality ${prod.name.toLowerCase()}`,
      images: [`https://via.placeholder.com/300?text=${prod.name.replace(/ /g, '+')}`],
      stock: 20 + idx * 5,
      brand: ['Samsung', 'Sony', 'LG', 'Bosch'][idx % 4],
      seller: users[1 + (idx % 5)]._id,
      ratings: {
        average: 4 + Math.random() * 0.9,
        count: 15 + idx * 3
      },
      isVerified: true
    })));
    console.log(`✅ Created ${products.length} marketplace products\n`);

    // ============ GARAGES ============
    console.log('🏢 Creating Garages...');
    const garages = await Garage.insertMany([
      {
        name: 'Elite Auto Care Center',
        address: 'Motijheel, Dhaka',
        location: { latitude: 23.7641, longitude: 90.3836 },
        phone: '01700123456',
        services: ['Oil Change', 'Tire Repair', 'Engine Checkup', 'AC Repair', 'Brake Service'],
        rating: 4.7,
        isOpen: true,
        isVerified: true,
        status: 'approved',
        submittedBy: users[1]._id,
        approvedBy: users[0]._id,
        approvedAt: new Date(),
        email: 'elite@autocare.com',
        description: 'Professional auto repair and maintenance center',
        website: 'https://elite-autocare.com'
      },
      {
        name: 'Premium Car Service',
        address: 'Gulshan, Dhaka',
        location: { latitude: 23.8103, longitude: 90.4125 },
        phone: '01700234567',
        services: ['Brake Service', 'Battery Replacement', 'Paint Job', 'Alignment', 'Engine Work'],
        rating: 4.6,
        isOpen: true,
        isVerified: true,
        status: 'approved',
        submittedBy: users[2]._id,
        approvedBy: users[0]._id,
        approvedAt: new Date(),
        email: 'premium@carservice.com',
        description: 'Full-service car maintenance and repair'
      },
      {
        name: 'Quick Fix Auto Workshop',
        address: 'Kawran Bazar, Dhaka',
        location: { latitude: 23.7641, longitude: 90.3741 },
        phone: '01700345678',
        services: ['Car Wash', 'Oil Change', 'Battery Check', 'Filter Replacement'],
        rating: 4.4,
        isOpen: true,
        isVerified: true,
        status: 'approved',
        submittedBy: users[3]._id,
        approvedBy: users[0]._id,
        approvedAt: new Date(),
        email: 'quickfix@workshop.com',
        description: 'Quick maintenance and minor repairs'
      },
      {
        name: 'Professional Auto Repair',
        address: 'Mirpur, Dhaka',
        location: { latitude: 23.8245, longitude: 90.3625 },
        phone: '01700456789',
        services: ['Major Repairs', 'Transmission Service', 'Electrical Work'],
        rating: 4.5,
        isOpen: true,
        isVerified: true,
        status: 'approved',
        submittedBy: users[4]._id,
        approvedBy: users[0]._id,
        approvedAt: new Date(),
        email: 'prof@autorepair.com',
        description: 'Specialized auto repair services'
      }
    ]);
    console.log(`✅ Created ${garages.length} garages\n`);

    // ============ SERVICE CENTERS ============
    console.log('🔧 Creating Service Centers...');
    const serviceCenters = await ServiceCenter.insertMany([
      {
        name: 'Toyota Genuine Service Center',
        location: { latitude: 23.8245, longitude: 90.3625, address: 'Mirpur, Dhaka' },
        phone: '01712345678',
        email: 'toyota@service.com',
        services: ['Warranty Service', 'Free Inspection', 'Genuine Parts'],
        workingHours: { open: '9 AM', close: '6 PM' },
        ratings: { average: 4.8, count: 152 },
        isVerified: true
      },
      {
        name: 'Honda Care Service',
        location: { latitude: 23.8103, longitude: 90.4125, address: 'Banani, Dhaka' },
        phone: '01723456789',
        email: 'honda@service.com',
        services: ['Maintenance', 'Repair', 'Parts Supply'],
        workingHours: { open: '8:30 AM', close: '6:30 PM' },
        ratings: { average: 4.7, count: 138 },
        isVerified: true
      },
      {
        name: 'Hyundai Service Plus',
        location: { latitude: 23.7641, longitude: 90.3836, address: 'Dhanmondi, Dhaka' },
        phone: '01734567890',
        email: 'hyundai@service.com',
        services: ['Free Service', 'Extended Warranty', 'Genuine Parts'],
        workingHours: { open: '9 AM', close: '7 PM' },
        ratings: { average: 4.6, count: 121 },
        isVerified: true
      }
    ]);
    console.log(`✅ Created ${serviceCenters.length} service centers\n`);

    // ============ JOBS ============
    console.log('💼 Creating Job Postings...');
    const jobs = await Job.insertMany([
      {
        title: 'Expert Car Mechanic',
        owner: users[1]._id,
        location: 'Motijheel, Dhaka',
        salary: 50000,
        carModel: 'Toyota Prius 2024',
        description: 'Experienced mechanic needed for routine maintenance and repairs',
        requirements: '3+ years experience in automotive repairs',
        jobType: 'full-time',
        status: 'open'
      },
      {
        title: 'Professional Car Painter',
        owner: users[2]._id,
        location: 'Kawran Bazar, Dhaka',
        salary: 40000,
        carModel: 'Honda Civic 2023',
        description: 'Expert painter needed for all types of vehicle finishing',
        requirements: '2+ years experience in vehicle painting',
        jobType: 'full-time',
        status: 'open'
      },
      {
        title: 'AC Technician',
        owner: users[3]._id,
        location: 'Gulshan, Dhaka',
        salary: 32500,
        carModel: 'Hyundai Creta 2024',
        description: 'Specialist in car air conditioning systems',
        requirements: '2+ years experience in AC repairs',
        jobType: 'full-time',
        status: 'open'
      },
      {
        title: 'Car Electrician',
        owner: users[4]._id,
        location: 'Mirpur, Dhaka',
        salary: 36500,
        carModel: 'Nissan Sunny 2022',
        description: 'Electrical system specialist for vehicles',
        requirements: '3+ years experience in automotive electrical systems',
        jobType: 'full-time',
        status: 'open'
      },
      {
        title: 'Transmission Specialist',
        owner: users[5]._id,
        location: 'Mohakhali, Dhaka',
        salary: 45000,
        carModel: 'Suzuki Swift 2024',
        description: 'Transmission and drivetrain expert',
        requirements: '4+ years experience in transmission repairs',
        jobType: 'full-time',
        status: 'open'
      }
    ]);
    console.log(`✅ Created ${jobs.length} job postings\n`);

    // ============ REVIEWS ============
    console.log('⭐ Creating Reviews...');
    const reviews = await Review.insertMany(
      cars.slice(0, 5).map((car, idx) => ({
        user: users[1 + idx]._id,
        targetType: 'car',
        targetId: car._id,
        rating: 4 + Math.random(),
        comment: `Excellent experience with this ${car.brand} ${car.model}!`,
        isVerified: true,
        createdAt: new Date()
      })).concat(
        products.slice(0, 5).map((prod, idx) => ({
          user: users[2 + idx]._id,
          targetType: 'product',
          targetId: prod._id,
          rating: 4.5 + Math.random() * 0.4,
          comment: `Great quality product! Highly recommended.`,
          isVerified: true,
          createdAt: new Date()
        }))
      )
    );
    console.log(`✅ Created ${reviews.length} reviews\n`);

    // ============ FORUMS ============
    console.log('💬 Creating Forum Posts...');
    const forums = await Forum.insertMany([
      {
        author: users[1]._id,
        title: 'Best car maintenance tips',
        content: 'Regular maintenance extends vehicle life significantly...',
        category: 'maintenance',
        createdAt: new Date()
      },
      {
        author: users[2]._id,
        title: 'Car rental tips for beginners',
        content: 'Always inspect the vehicle before renting...',
        category: 'tips',
        createdAt: new Date()
      },
      {
        author: users[3]._id,
        title: 'Most affordable cars to rent',
        content: 'Budget cars that provide excellent value...',
        category: 'general',
        createdAt: new Date()
      },
      {
        author: users[4]._id,
        title: 'Fuel saving driving techniques',
        content: 'Drive efficiently to save on fuel costs...',
        category: 'tips',
        createdAt: new Date()
      },
      {
        author: users[5]._id,
        title: 'Essential garage equipment',
        content: 'Tools every professional garage needs...',
        category: 'maintenance',
        createdAt: new Date()
      },
      {
        author: users[6]._id,
        title: 'Car buying guide 2026',
        content: 'A comprehensive guide to purchasing vehicles...',
        category: 'buy-sell',
        createdAt: new Date()
      }
    ]);
    console.log(`✅ Created ${forums.length} forum posts\n`);

    // ============ BOOKINGS ============
    console.log('📅 Creating Sample Bookings...');
    const bookings = await Booking.insertMany([
      {
        car: cars[0]._id,
        owner: cars[0].owner,
        renter: users[1]._id,
        bookingType: 'rent',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 172800000),
        rateType: 'hourly',
        totalAmount: 3500,
        securityDeposit: 1000,
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        car: cars[1]._id,
        owner: cars[1].owner,
        renter: users[2]._id,
        bookingType: 'rent',
        startDate: new Date(Date.now() + 259200000),
        endDate: new Date(Date.now() + 345600000),
        rateType: 'daily',
        totalAmount: 20000,
        securityDeposit: 5000,
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        car: cars[2]._id,
        owner: cars[2].owner,
        renter: users[3]._id,
        bookingType: 'rent',
        startDate: new Date(Date.now() + 432000000),
        endDate: new Date(Date.now() + 518400000),
        rateType: 'hourly',
        totalAmount: 4000,
        securityDeposit: 1000,
        status: 'pending',
        paymentStatus: 'pending'
      },
      {
        car: cars[3]._id,
        owner: cars[3].owner,
        renter: users[4]._id,
        bookingType: 'rent',
        startDate: new Date(Date.now() + 604800000),
        endDate: new Date(Date.now() + 691200000),
        rateType: 'daily',
        totalAmount: 16000,
        securityDeposit: 4000,
        status: 'active',
        paymentStatus: 'paid'
      },
      {
        car: cars[4]._id,
        owner: cars[4].owner,
        renter: users[5]._id,
        bookingType: 'rent',
        startDate: new Date(Date.now() + 777600000),
        endDate: new Date(Date.now() + 864000000),
        rateType: 'hourly',
        totalAmount: 2200,
        securityDeposit: 800,
        status: 'pending',
        paymentStatus: 'pending'
      }
    ]);
    console.log(`✅ Created ${bookings.length} bookings\n`);

    // ============ SUMMARY ============
    console.log('═══════════════════════════════════════════════════════');
    console.log('   ✅ Data Appended Successfully!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 New Data Added:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🚗 Cars: ${cars.length}`);
    console.log(`   🛒 Products: ${products.length}`);
    console.log(`   🏢 Garages: ${garages.length}`);
    console.log(`   🔧 Service Centers: ${serviceCenters.length}`);
    console.log(`   💼 Jobs: ${jobs.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log(`   💬 Forum Posts: ${forums.length}`);
    console.log(`   📅 Bookings: ${bookings.length}`);
    
    const newTotal = users.length + cars.length + products.length + garages.length + 
                     serviceCenters.length + jobs.length + reviews.length + forums.length + bookings.length;
    console.log(`\n   ➕ Total New Documents: ${newTotal}`);

    // Get final counts
    console.log('\n📊 Final database state:');
    const finalCounts = {
      users: await User.countDocuments(),
      cars: await Car.countDocuments(),
      products: await Product.countDocuments(),
      garages: await Garage.countDocuments(),
      serviceCenters: await ServiceCenter.countDocuments(),
      jobs: await Job.countDocuments(),
      reviews: await Review.countDocuments(),
      forums: await Forum.countDocuments(),
      bookings: await Booking.countDocuments()
    };
    const grandTotal = Object.values(finalCounts).reduce((a, b) => a + b, 0);
    
    console.log(`   Users: ${finalCounts.users} (+${finalCounts.users - existingCounts.users})`);
    console.log(`   Cars: ${finalCounts.cars} (+${finalCounts.cars - existingCounts.cars})`);
    console.log(`   Products: ${finalCounts.products} (+${finalCounts.products - existingCounts.products})`);
    console.log(`   Garages: ${finalCounts.garages} (+${finalCounts.garages - existingCounts.garages})`);
    console.log(`   Service Centers: ${finalCounts.serviceCenters} (+${finalCounts.serviceCenters - existingCounts.serviceCenters})`);
    console.log(`   Jobs: ${finalCounts.jobs} (+${finalCounts.jobs - existingCounts.jobs})`);
    console.log(`   Reviews: ${finalCounts.reviews} (+${finalCounts.reviews - existingCounts.reviews})`);
    console.log(`   Forum Posts: ${finalCounts.forums} (+${finalCounts.forums - existingCounts.forums})`);
    console.log(`   Bookings: ${finalCounts.bookings} (+${finalCounts.bookings - existingCounts.bookings})`);
    console.log(`\n   📦 Grand Total: ${grandTotal} documents\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedData();

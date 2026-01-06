const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { seedSuperAdmin } = require('./controllers/authController');

// Load env variables
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to Database
connectDB();

// Seed Super Admin on startup
seedSuperAdmin();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/service-centers', require('./routes/serviceCenterRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User joins their own room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join a chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', {
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      timestamp: new Date(),
    });
  });

  // Real-time chat typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  // Stop typing indicator
  socket.on('stop-typing', (data) => {
    socket.to(data.conversationId).emit('user-stop-typing', {
      userId: data.userId,
    });
  });

  // Update driver location in real-time
  socket.on('update-location', (data) => {
    io.emit('driver-location-update', {
      driverId: data.driverId,
      driverName: data.driverName,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    });
  });

  // Live car tracking (for rentals)
  socket.on('track-car', (data) => {
    socket.join(`car-${data.carId}`);
    console.log(`Tracking car: ${data.carId}`);
  });

  socket.on('car-location-update', (data) => {
    io.to(`car-${data.carId}`).emit('car-location', {
      carId: data.carId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      timestamp: new Date(),
    });
  });

  // Forum real-time updates
  socket.on('new-post', (data) => {
    io.emit('forum-new-post', data);
  });

  socket.on('new-comment', (data) => {
    io.to(`post-${data.postId}`).emit('forum-new-comment', data);
  });

  // Booking status updates
  socket.on('booking-update', (data) => {
    io.to(data.userId).emit('booking-status-changed', data);
  });

  // Job application updates
  socket.on('job-application', (data) => {
    io.to(data.ownerId).emit('new-job-application', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Car Sahajjo API is running',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});
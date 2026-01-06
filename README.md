# 🚗 Car Sahajjo - Complete Automotive Service Platform

A comprehensive full-stack MERN application for car services including rentals, driver hiring, marketplace, and community features.

## ✨ Features

### 🧍‍♂️ User Management
- Multiple user roles: Owner, Driver, Admin
- JWT authentication with secure login/registration
- Profile management with photo, license, and address
- KYC verification system for drivers
- Admin approval workflow

### 💼 Driver Hiring & Job System
- Job posting by car owners
- Driver application system
- Application status tracking (pending, accepted, rejected)
- Interview scheduling
- Role-based dashboards

### 🚘 Car Management
- Complete CRUD operations for cars
- Advanced search and filters (brand, fuel type, transmission, price)
- Car listings for sale and rent
- Document management (RC, insurance, pollution)
- Admin verification system
- Document expiry tracking

### 📅 Booking System
- Calendar-based booking interface
- Hourly and daily rental rates
- Conflict detection to prevent double booking
- Booking status management
- Security deposit handling

### 🛒 Marketplace
- Product catalog for car parts, tools, and accessories
- Shopping cart functionality
- Order processing and tracking
- Vendor management
- Product verification by admin
- Review and rating system

### ⭐ Review & Rating System
- Star ratings for drivers, products, and cars
- Text-based feedback
- Admin moderation tools
- Average rating calculation

### 🗺️ Service Center Integration
- GPS-based service center listings
- Nearby service center search
- Service booking system
- Google Maps integration ready

### 💳 Payment Integration
- SSLCommerz payment gateway (Bangladesh)
- Secure transaction handling
- Payment status tracking

### 💬 Real-Time Features (Socket.io)
- In-app chat messaging
- Typing indicators
- Live driver location tracking
- Real-time notifications
- Forum updates

### 📢 Notifications
- In-app notification system
- Notification bell with unread count
- Multiple notification types
- Read/unread status tracking

### 🌐 Community Forum
- Social feed with posts
- Comments and likes
- Tag-based filtering
- Content moderation

### 🎨 UI/UX Features
- Dark mode support with theme toggle
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Modern glassmorphism effects
- Toast notifications

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notifications
- **Google Maps API** - Maps integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time features
- **SSLCommerz** - Payment gateway
- **Nodemailer** - Email service
- **Cloudinary** - Image hosting
- **Multer** - File upload

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Car_Sahajjo
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
```

Create `server/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/car_sahajjo
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SSLCommerz (for payments)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

```bash
# Start the server
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Default Admin Account

After starting the server, a super admin account is automatically created:
- **Email:** rabbanihosni10@gmail.com
- **Password:** admin123

## 📁 Project Structure

```
Car_Sahajjo/
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── assets/         # Images, icons
│   │   ├── components/     # Reusable components
│   │   │   ├── Map/
│   │   │   ├── Notifications/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/        # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Cars.jsx
│   │   │   ├── CarDetails.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Jobs.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── utils/          # Utility functions
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                  # Backend Node.js app
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── bookingController.js
│   │   ├── jobController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── serviceCenterController.js
│   │   ├── notificationController.js
│   │   ├── messageController.js
│   │   ├── forumController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   ├── Job.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── ServiceCenter.js
│   │   ├── Notification.js
│   │   ├── Message.js
│   │   └── Forum.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── serviceCenterRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── forumRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── userRoutes.js
│   ├── index.js            # Server entry point
│   └── package.json
│
└── PROJECT_STATUS.md        # Detailed feature status
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/kyc` - Update KYC documents
- `PUT /api/users/:id/approve` - Approve user (Admin)

### Cars
- `POST /api/cars` - Create car
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get car details
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `GET /api/cars/my/cars` - Get my cars
- `PUT /api/cars/:id/verify` - Verify car (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/my/bookings` - Get my bookings
- `GET /api/bookings/check-availability/:carId` - Check availability
- `PUT /api/bookings/:id/status` - Update booking status

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job
- `PUT /api/jobs/:id/applications/:applicationId` - Update application status

### Products & Orders
- `POST /api/products` - Create product
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products/orders` - Create order
- `GET /api/products/orders/my/orders` - Get my orders

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:targetType/:targetId` - Get reviews by target
- `PUT /api/reviews/:id/moderate` - Moderate review (Admin)

### Service Centers
- `POST /api/service-centers` - Create service center (Admin)
- `GET /api/service-centers` - Get all service centers
- `GET /api/service-centers/nearby` - Get nearby centers
- `POST /api/service-centers/:id/book` - Book service

### Notifications
- `GET /api/notifications` - Get my notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `GET /api/messages/unread/count` - Get unread count

### Forum
- `POST /api/forum` - Create post
- `GET /api/forum` - Get all posts
- `PUT /api/forum/:id/like` - Like post
- `POST /api/forum/:id/comment` - Add comment

### Payments
- `POST /api/payment/init` - Initialize payment
- `POST /api/payment/validate` - Validate payment

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Update CORS origin to production URL
3. Deploy using Git push

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in `api.js`

## 📝 Features in Development

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed feature completion status.

**Current Status: ~60% Complete**
- ✅ Backend: 100%
- ⚠️ Frontend: 40%
- ⚠️ Advanced Features: 20%

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Contact

For questions or support, please contact:
- Email: rabbanihosni10@gmail.com

## 🙏 Acknowledgments

- React community
- MongoDB documentation
- Express.js guides
- Tailwind CSS
- Socket.io documentation

---

**Built with ❤️ for CSE391 Project**

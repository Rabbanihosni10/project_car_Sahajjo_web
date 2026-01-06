# 🚀 Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] MongoDB installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 5-Minute Setup

### 1. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to server folder
cd server

# Install dependencies (first time only)
npm install

# Start server
npm run dev
```

✅ Server running at: http://localhost:5000

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to client folder (new terminal)
cd client

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ Client running at: http://localhost:5173

### 4. Access the Application

Open browser and visit: **http://localhost:5173**

### 5. Login with Default Admin

- **Email:** rabbanihosni10@gmail.com
- **Password:** admin123
- **Role:** Admin (full access)

## Test the Features

### As Admin:

1. Visit `/dashboard` - See admin options
2. Visit `/admin` - Access admin panel
3. Visit `/cars` - Browse all cars
4. Visit `/marketplace` - Browse products
5. Visit `/jobs` - View job listings

### As Regular User:

1. Click "Get Started" on home page
2. Register with any email
3. Choose role: Owner or Driver
4. Explore the platform!

## Common Issues & Fixes

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh

# If not working, start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use

```bash
# Backend (port 5000)
# Change PORT in server/.env

# Frontend (port 5173)
# Change in client/vite.config.js
```

### Module Not Found Error

```bash
# Delete node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

### Required (server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/car_sahajjo
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Optional (for advanced features)

```env
# For image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# For emails
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# For payments (already configured with sandbox)
SSLCOMMERZ_STORE_ID=skill6800aa2b1a8fd
SSLCOMMERZ_STORE_PASSWORD=skill6800aa2b1a8fd@ssl
SSLCOMMERZ_IS_LIVE=false
```

## Quick Feature Test Checklist

### Test as Admin:

- [ ] Login with admin credentials
- [ ] Navigate to Dashboard
- [ ] Toggle dark mode
- [ ] Check notifications
- [ ] Browse cars
- [ ] Browse marketplace
- [ ] View job listings

### Test as Owner:

- [ ] Register new owner account
- [ ] Add a new car
- [ ] Post a job
- [ ] Add product to marketplace
- [ ] View dashboard stats

### Test as Driver:

- [ ] Register new driver account
- [ ] Apply for a job
- [ ] Browse cars for rent
- [ ] Send a message
- [ ] Check notifications

## Available Routes

### Public Routes:

- `/` - Home page
- `/login` - Login page
- `/register` - Registration
- `/cars` - Browse cars
- `/cars/:id` - Car details
- `/marketplace` - Browse products
- `/jobs` - Browse jobs

### Protected Routes:

- `/dashboard` - User dashboard
- `/cart` - Shopping cart
- `/map` - Live GPS map

### Admin Routes:

- `/admin` - Admin panel

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

- Backend: Changes auto-restart with nodemon
- Frontend: Changes reflect instantly in browser

### Database Access

```bash
# Open MongoDB shell
mongosh

# Use the database
use car_sahajjo

# View collections
show collections

# View users
db.users.find().pretty()
```

### API Testing

Use tools like:

- Postman
- Thunder Client (VS Code extension)
- Browser DevTools Network tab

Base URL: `http://localhost:5000/api`

Example endpoints:

- GET `/api/cars` - Get all cars
- GET `/api/jobs` - Get all jobs
- GET `/api/products` - Get all products
- POST `/api/auth/login` - Login user

## Deployment Checklist

When ready to deploy:

### Backend:

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas for database
- [ ] Set secure JWT_SECRET
- [ ] Update CORS origin to production URL
- [ ] Enable SSL for MongoDB connection

### Frontend:

- [ ] Update API base URL in `client/src/utils/api.js`
- [ ] Build project: `npm run build`
- [ ] Deploy `dist` folder

### Hosting Options:

- **Backend:** Heroku, Railway, Render, DigitalOcean
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** MongoDB Atlas (free tier available)

## Getting Help

### Check Documentation:

1. [README.md](README.md) - Full setup guide
2. [PROJECT_STATUS.md](PROJECT_STATUS.md) - Feature status
3. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was built

### Common Commands:

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

## Success Indicators

You'll know everything is working when:

- ✅ No console errors
- ✅ Can register and login
- ✅ Can browse cars/products/jobs
- ✅ Dark mode toggle works
- ✅ Notifications bell appears
- ✅ Can add items to cart
- ✅ Real-time features work

---

## 🎉 You're All Set!

Your Car Sahajjo application is now running!

**Next Steps:**

1. Explore the features
2. Test with different user roles
3. Try dark mode
4. Add some test data
5. Start customizing!

**Happy Coding! 🚗💨**

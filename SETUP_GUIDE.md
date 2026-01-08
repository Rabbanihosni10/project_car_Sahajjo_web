# Car Sahajjo - Complete Setup & Startup Guide

## 🚀 Project Overview

Car Sahajjo is a full-stack web application for car rental and driver hiring services in Bangladesh.

**Tech Stack:**

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Real-time**: WebSockets for live messaging and notifications
- **Authentication**: JWT-based authentication
- **Payments**: SSLCommerz payment gateway

---

## ✅ System Requirements

- **Node.js**: v18.0.0 or higher (v20.12.1 currently installed)
- **npm**: v8.0.0 or higher
- **MongoDB**: Running locally on `mongodb://localhost:27017` or cloud URL
- **Port 5000**: Must be available for backend
- **Port 5173**: Must be available for frontend (Vite dev server)

---

## 📁 Project Structure

```
Car_Sahajjo/
├── client/          # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/          # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── config/
│   ├── .env
│   └── package.json
└── README.md
```

---

## 🔧 Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

**Expected output:** ✓ Installed X packages

### Step 2: Install Frontend Dependencies

```bash
cd client
npm install
```

**Expected output:** ✓ Installed X packages

### Step 3: Start MongoDB

- **Local MongoDB:**
  ```bash
  mongod
  ```
- **Or use MongoDB Atlas** (update MONGO_URI in `server/.env`)

### Step 4: Verify Configuration

Check `server/.env` has all required variables:

- ✓ PORT=5000
- ✓ MONGO_URI=mongodb://localhost:27017/carsahajjo
- ✓ JWT_SECRET=carsahajjo_secret_key_2025
- ✓ NODE_ENV=development

---

## 🎯 Starting the Application

### Option A: Terminal Commands (Recommended)

**Terminal 1 - Start Backend:**

```bash
cd server
npm start
```

Expected: `🚀 Server running on port 5000`

**Terminal 2 - Start Frontend:**

```bash
cd client
npm run dev
```

Expected: `✓ Local: http://localhost:5173`

---

### Option B: Using Startup Scripts

**Windows - Batch Script:**

```bash
cd server
start-server.bat
```

**Windows - PowerShell:**

```powershell
cd server
.\start-server.ps1
```

**Linux/Mac - Bash Script:**

```bash
cd server
bash check-status.sh
```

---

## 🌐 Accessing the Application

1. **Open Browser:**

   ```
   http://localhost:5173
   ```

2. **Login Credentials (Test Account):**

   - **Email**: rabbanihosni10@gmail.com
   - **Password**: 123456
   - **Role**: Super Admin

3. **Other Test Accounts:**
   - Create new accounts in the app
   - Or check database for existing users

---

## 🧪 Testing the Server

### Check Server Health

```bash
curl http://localhost:5000/
# Response: {"success":true,"message":"Car Sahajjo API is running",...}
```

### Test API Endpoints

```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Get all forum posts
curl http://localhost:5000/api/forum

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rabbanihosni10@gmail.com","password":"123456"}'
```

### Test Authenticated Endpoints

```bash
# Get user's bookings
curl http://localhost:5000/api/bookings/my/bookings \
  -H "Authorization: Bearer TOKEN"

# Get user's forum posts
curl http://localhost:5000/api/forum/my/posts \
  -H "Authorization: Bearer TOKEN"
```

---

## 📋 Available npm Scripts

### Backend (server/)

- `npm start` - Start production server
- `npm run dev` - Start with auto-reload (requires nodemon)

### Frontend (client/)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

---

## 🐛 Troubleshooting

### Server Won't Start

**Problem: "Port 5000 already in use"**

```bash
# Option 1: Kill existing process
taskkill /IM node.exe /F    # Windows
lsof -ti:5000 | xargs kill -9  # Mac/Linux

# Option 2: Use different port
# Edit server/.env and change PORT=5001
```

**Problem: "Cannot find module..."**

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

**Problem: "MongoDB connection failed"**

```bash
# Check if MongoDB is running
# Mac/Linux: brew services start mongodb-community
# Windows: Check Services or use MongoDB Atlas

# Or update MONGO_URI in server/.env
```

---

### Frontend Issues

**Problem: "Blank page or compilation error"**

```bash
cd client
npm install
npm run build
npm run dev
```

**Problem: "Can't connect to API"**

1. Check backend is running on port 5000
2. Check CORS configuration in `server/index.js`
3. Check frontend API URL in `client/src/utils/api.js`

---

## 🔐 Environment Variables

### Backend (.env file)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/carsahajjo
JWT_SECRET=carsahajjo_secret_key_2025
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### Frontend (.env - if needed)

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## 📊 Database

### Collections in MongoDB

- `users` - User accounts (drivers, owners, admins)
- `cars` - Car listings
- `bookings` - Car rental bookings
- `jobs` - Job postings
- `forums` - Forum posts and discussions
- `messages` - User-to-user messages
- `notifications` - User notifications
- `products` - Marketplace products
- `orders` - Product orders
- `reviews` - Product/service reviews

---

## 🚀 Production Deployment

### Before Deploying

1. Update `NODE_ENV=production` in .env
2. Update `MONGO_URI` to production database
3. Update `SERVER_URL` and `CLIENT_URL` to production domains
4. Set secure `JWT_SECRET` (strong random string)
5. Update API keys (Google Maps, SSLCommerz, etc.)
6. Build frontend: `npm run build` in client folder

### Deployment Platforms

- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Render
- **Database**: MongoDB Atlas, AWS DocumentDB, Azure Cosmos DB

---

## 📚 Project Documentation

- Backend API: See `server/START_SERVER.md`
- Routes: Check individual route files in `server/routes/`
- Controllers: Business logic in `server/controllers/`
- Models: Data schemas in `server/models/`

---

## 🆘 Getting Help

### Common Issues & Solutions

1. **Port conflicts**: Change PORT in .env
2. **Module errors**: Run `npm install`
3. **Database errors**: Check MongoDB connection string
4. **CORS errors**: Verify frontend URL in backend config
5. **Auth errors**: Check JWT_SECRET and token validity

### Server Status Checker

```bash
cd server
bash check-status.sh  # Run status check script
```

---

## ✨ Features

✅ User authentication (login/register)
✅ Role-based access (admin, driver, owner)
✅ Car rental bookings
✅ Job postings and applications
✅ Real-time messaging
✅ Forum discussions
✅ Notifications system
✅ Marketplace (products/services)
✅ Payment gateway integration
✅ Google Maps integration
✅ Dark/Light theme toggle
✅ Responsive design

---

## 📝 Notes

- **Server**: Runs on `http://localhost:5000`
- **Frontend**: Runs on `http://localhost:5173`
- **Database**: MongoDB at `mongodb://localhost:27017`
- **Real-time**: Socket.io enabled for live features
- **API Documentation**: Check Postman collection or API endpoints

---

## 🎯 Quick Commands Reference

```bash
# Start everything
cd server && npm start &        # Terminal 1
cd client && npm run dev        # Terminal 2

# Build for production
cd client && npm run build

# Check server status
curl http://localhost:5000/

# Install dependencies
npm install

# Run database migrations (if any)
# Custom scripts in package.json

# Stop all processes
Ctrl+C in each terminal
```

---

**Last Updated**: January 8, 2026
**Status**: ✅ All Systems Operational
**Tested**: Backend ✓ | Frontend ✓ | Database ✓ | Real-time ✓

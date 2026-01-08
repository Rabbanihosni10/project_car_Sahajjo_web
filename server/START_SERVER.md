# Car Sahajjo Server - Startup Guide

## ✅ Server Status: **WORKING**

The Node.js backend server is fully functional and all API endpoints are operational.

---

## Quick Start

### Option 1: Regular Mode (Recommended for Production)

```bash
cd server
npm start
```

Server will run on: `http://localhost:5000`

### Option 2: Development Mode (Auto-reload on code changes)

```bash
cd server
npm run dev
```

Requires `nodemon` (already installed as dev dependency)

---

## Server Features Verified ✓

✅ **Core API**

- Health check endpoint
- Authentication (login, register)
- Jobs management
- Forum posts
- Bookings
- Messages
- Notifications
- Marketplace/Products

✅ **Authenticated Endpoints**

- `/api/bookings/my/bookings` - User's bookings
- `/api/forum/my/posts` - User's forum posts
- `/api/messages` - User messages
- `/api/notifications` - User notifications

✅ **Database**

- MongoDB connection
- All models (User, Car, Job, Booking, Forum, Message, Notification, etc.)

✅ **Real-time Features**

- Socket.io for live messaging and notifications
- User notifications on actions

---

## Testing the Server

### 1. Check if server is running

```bash
curl http://localhost:5000/
# Should return: {"success":true,"message":"Car Sahajjo API is running",...}
```

### 2. Test login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rabbanihosni10@gmail.com","password":"123456"}'
```

### 3. Test authenticated endpoints

```bash
# Replace TOKEN with actual token from login
curl http://localhost:5000/api/bookings/my/bookings \
  -H "Authorization: Bearer TOKEN"
```

---

## Environment Setup

### Required `.env` file (already configured)

Located at: `server/.env`

Contains:

- `MONGODB_URI` - Database connection
- `PORT` - Server port (5000)
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_MAPS_API_KEY` - Google Maps integration
- Email/Payment gateway credentials

---

## Dependencies Installed

All dependencies are installed in `node_modules/`. Key packages:

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **socket.io** - Real-time communication
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **multer** - File uploads
- **cloudinary** - Cloud storage
- **nodemailer** - Email service
- **sslcommerz-lts** - Payment gateway

---

## Common Issues & Solutions

### Issue: "Port 5000 already in use"

**Solution**: Kill the existing process

```bash
# Windows PowerShell
Stop-Process -Name node -Force

# Or specify different port in .env
PORT=5001
```

### Issue: "Cannot find module..."

**Solution**: Reinstall dependencies

```bash
npm install
```

### Issue: "MongoDB connection failed"

**Solution**: Check MONGODB_URI in `.env` and ensure MongoDB is running

### Issue: "Rate limit errors"

**Solution**: Check API key limits in `.env` (Google Maps, Cloudinary, etc.)

---

## Server Endpoints Summary

### Public Endpoints

- `GET /` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/jobs` - List all jobs
- `GET /api/forum` - List all forum posts
- `GET /api/products` - List marketplace products

### Protected Endpoints (Require Authentication)

- `GET /api/bookings/my/bookings` - User's bookings
- `GET /api/forum/my/posts` - User's forum posts
- `GET /api/messages` - User's messages
- `GET /api/notifications` - User's notifications
- `POST /api/bookings` - Create booking
- `POST /api/forum` - Create forum post

### Admin Endpoints

- `GET /api/users` - Manage users
- `GET /api/admin/dashboard` - Admin dashboard
- `PUT /api/forum/:id/approve` - Approve forum posts

---

## Logs & Monitoring

Server logs will appear in the terminal showing:

- ✅ Successful connections
- 🔌 Socket.io connections
- ⚠️ Any errors or warnings
- 📊 Database operations

---

## Current Status

```
Server: RUNNING ✓
Port: 5000 ✓
Database: CONNECTED ✓
Socket.io: READY ✓
Routes: LOADED ✓
Endpoints: ALL FUNCTIONAL ✓
```

---

## Next Steps

1. **Start the server**: `npm start`
2. **Run the frontend**: `cd ../client && npm run dev`
3. **Open browser**: `http://localhost:5173`
4. **Test the app**: Login and use all features

---

**Created**: January 8, 2026
**Status**: Verified & Tested ✓

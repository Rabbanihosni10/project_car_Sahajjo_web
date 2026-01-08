# Garage Approval & Map Display Workflow

## ✅ Complete Workflow (End-to-End)

### 1. **User Submits Garage** (`/submit-garage`)

- User fills in garage details: name, address, latitude/longitude, phone, email, website, services
- Garage is **saved to database** with `status: 'pending'`
- Submitter receives a message: "Garage submitted for approval"

### 2. **Admin Reviews & Approves** (Admin Panel)

- Admin logs in → goes to **Admin Panel** → scrolls to **"Garage Submissions"**
- Sees all pending garage submissions
- Clicks **"Approve"** button
- System updates:
  - Garage status: `'pending'` → `'approved'`
  - Is verified: `true`
  - Approved by: `admin_id`
  - Approved at: `current_timestamp`
  - **Database is updated immediately**
  - Submitter receives notification: "Your garage has been approved and is now visible on the map"

### 3. **Garage Appears on Map** (LeafletMap & LiveMap)

- Both map components fetch `/api/garages` (only approved garages)
- Garage data is loaded and displayed as a red marker
- Users can see all approved garages in real-time
- Console log shows: `🏠 Loaded X approved garages from database: [garage names]`

---

## 📊 Database Flow

```
User Submission
    ↓
Garage Model (status='pending')
    ↓
Admin Reviews
    ↓
Admin Approves (PUT /api/garages/:id/approve)
    ↓
Garage Updated (status='approved', isVerified=true)
    ↓
GET /api/garages (filters status='approved')
    ↓
Map displays garage with other approved locations
```

---

## 🔧 Technical Details

### Backend Endpoints

#### Submit Garage (User)

```
POST /api/garages/submit
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "name": "AutoCare Center",
  "address": "123 Main Street, Dhaka",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "phone": "+880 1234567890",
  "email": "contact@garage.com",
  "website": "https://www.garage.com",
  "services": ["Oil Change", "Brake Service"],
  "description": "Professional auto service"
}

Response: 201 Created
{
  "success": true,
  "message": "Garage submitted for approval",
  "garage": {...}
}
```

#### Get Pending Garages (Admin)

```
GET /api/garages/admin/pending
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "garages": [
    {
      "_id": "123...",
      "name": "AutoCare Center",
      "status": "pending",
      "submittedBy": {...},
      ...
    }
  ]
}
```

#### Approve Garage (Admin)

```
PUT /api/garages/:id/approve
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "message": "Garage approved successfully",
  "garage": {
    "_id": "123...",
    "name": "AutoCare Center",
    "status": "approved",  // ← CHANGED
    "isVerified": true,    // ← CHANGED
    "approvedBy": "admin_id",
    "approvedAt": "2026-01-08T10:30:00.000Z"
  }
}
```

#### Get All Approved Garages (Public)

```
GET /api/garages
No Authorization needed

Response: 200 OK
{
  "success": true,
  "garages": [
    {
      "_id": "123...",
      "name": "AutoCare Center",
      "address": "123 Main Street, Dhaka",
      "location": {
        "latitude": 23.8103,
        "longitude": 90.4125
      },
      "status": "approved",
      "isVerified": true,
      "phone": "+880 1234567890",
      "services": ["Oil Change", "Brake Service"],
      "rating": 4.8,
      "isOpen": true
    }
  ]
}
```

### Frontend Components

#### Map Display (LeafletMap.jsx)

```javascript
useEffect(() => {
  fetchGarages();  // Loads approved garages on mount
  // ...
}, [...]);

const fetchGarages = useCallback(async () => {
  const response = await api.get('/garages');  // Only approved
  const formattedGarages = response.data.garages.map(garage => ({
    id: garage._id,
    name: garage.name,
    position: {
      lat: garage.location.latitude,
      lng: garage.location.longitude
    },
    // ...
  }));
  setNearbyGarages(formattedGarages);
  console.log(`🏠 Loaded ${formattedGarages.length} approved garages`);
}, []);
```

#### Admin Panel (AdminPanel.jsx)

```javascript
const handleApproveGarage = async (garageId) => {
  const response = await api.put(`/garages/${garageId}/approve`);
  toast.success(`✅ Garage approved! Now visible on the map.`);
  fetchPendingGarages(); // Refresh list
};
```

---

## 🧪 Testing the Workflow

### 1. **Start the Application**

```bash
# Terminal 1: Server (on port 5001)
cd server
npm install
export PORT=5001 && npm run start

# Terminal 2: Client (on port 5173/5174)
cd client
export VITE_API_URL=http://localhost:5001/api && npm run dev
```

### 2. **Create a Test Garage**

- Sign in as regular user
- Navigate to Dashboard → Find "Submit Garage"
- Fill in the form with valid latitude/longitude (e.g., 23.8103, 90.4125 for Dhaka)
- Click "Submit"
- Should see: "Garage submitted for approval"

### 3. **Approve as Admin**

- Sign in as admin: `rabbanihosni10@gmail.com` / `123456`
- Go to Admin Panel
- Scroll to "Garage Submissions" section
- Click "Approve" on the pending garage
- Should see: "✅ Garage approved! Now visible on the map."

### 4. **Verify on Map**

- Navigate to Dashboard → "Find Garage" (LeafletMap)
- Should see the newly approved garage as a red marker 📍
- Browser console should show: `🏠 Loaded X approved garages from database: [garage names]`
- Click on marker to see garage details

### 5. **Run Garage Workflow Test**

```bash
cd server
node test-garage-workflow.js
```

---

## 🐛 Troubleshooting

### "Garage not showing on map after approval"

1. ✅ Check browser console for: `🏠 Loaded X approved garages`
2. ✅ Verify garage status in database: `db.garages.findOne({_id: ObjectId("...")})`
3. ✅ Ensure garage has valid `location.latitude` and `location.longitude`
4. ✅ Check that `status` is exactly `'approved'` (case-sensitive)

### "Admin doesn't see pending garages"

1. ✅ Verify user is actually admin: check `isAdmin` in token
2. ✅ Check that garage is in database with `status: 'pending'`
3. ✅ Run: `db.garages.find({status: 'pending'}).count()`

### "Toast not showing after approval"

1. ✅ Check network tab - PUT request should return 200 OK
2. ✅ Verify response contains garage data
3. ✅ Check browser console for errors

### "Garage locations not syncing in real-time"

- Maps fetch garages only on component mount
- To see newly approved garages, refresh the map page
- Optional: Can add auto-refresh feature (5 min poll)

---

## 📱 User Experience Flow

```
👤 User (Non-Admin)
├─ Dashboard → Submit Garage
├─ Fill form → Submit
├─ See: "Submitted for approval" ✓
└─ Wait for notification

⚙️ Admin
├─ Admin Panel → Garage Submissions
├─ Review pending submissions
├─ Click "Approve" ✓
└─ See: "Approved! Now visible on map"

🗺️ All Users
├─ Navigate to Map
├─ See all approved garages
└─ Click to view details
```

---

## ✨ Features

- ✅ Pending approval system
- ✅ Admin review & approve/reject
- ✅ Automatic notification to submitter
- ✅ Real-time map display
- ✅ Verified badge for approved garages
- ✅ Service categories for each garage
- ✅ Rating and status display
- ✅ Get directions integration

---

## 🚀 Next Steps

1. Test end-to-end workflow
2. Verify garage appears on both maps (LeafletMap and LiveMap)
3. Check console logs for debugging
4. Monitor notifications system
5. Consider adding auto-refresh to map (optional)

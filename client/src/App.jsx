import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import AddCar from './pages/AddCar';
import CreateJob from './pages/CreateJob';
import MyApplications from './pages/MyApplications';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import OrderHistory from './pages/OrderHistory';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Forum from './pages/Forum';
import MyJobs from './pages/MyJobs';
import Messages from './pages/Messages';
import Conversations from './pages/Conversations';
import UserProfile from './pages/UserProfile';
import LeafletMap from './components/Map/LeafletMap';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AiChat from './pages/AiChat';
import AiTranslate from './pages/AiTranslate';
import SubmitGarage from './pages/SubmitGarage';
import ManageGarages from './pages/ManageGarages';
import MyBookings from './pages/MyBookings';
import BookingRequests from './pages/BookingRequests';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Cars Routes */}
            <Route
              path="/cars"
              element={
                <ProtectedRoute>
                  <Cars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cars/add"
              element={
                <ProtectedRoute>
                  <AddCar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cars/:id"
              element={
                <ProtectedRoute>
                  <CarDetails />
                </ProtectedRoute>
              }
            />
            
            {/* Marketplace Routes */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={<Cart />}
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-history"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

            {/* Booking Routes */}
            <Route
              path="/bookings/my"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/requests"
              element={
                <ProtectedRoute>
                  <BookingRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            
            {/* Jobs Routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/my-posted"
              element={
                <ProtectedRoute>
                  <MyJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Conversations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant/chat"
              element={
                <ProtectedRoute>
                  <AiChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant/translate"
              element={
                <ProtectedRoute>
                  <AiTranslate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Forum Routes */}
            <Route
              path="/forum"
              element={
                <ProtectedRoute>
                  <Forum />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <LeafletMap />
                </ProtectedRoute>
              }
            />

            <Route
              path="/submit-garage"
              element={
                <ProtectedRoute>
                  <SubmitGarage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/garages"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageGarages />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;



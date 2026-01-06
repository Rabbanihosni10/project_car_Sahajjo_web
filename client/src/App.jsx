import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Jobs from './pages/Jobs';
import LiveMap from './components/Map/LiveMap';

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
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<Login />} />
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
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            
            {/* Marketplace Routes */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Jobs Routes */}
            <Route path="/jobs" element={<Jobs />} />
            
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <LiveMap />
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
  );
}

export default App;


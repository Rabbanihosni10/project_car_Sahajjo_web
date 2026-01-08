import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Wrench, AlertCircle, RefreshCw, Phone, Clock, Car } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const garageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center (Dhaka, Bangladesh)
const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
};

// Mock data for demonstration
const mockGarages = [
  {
    id: 'garage-1',
    name: 'AutoCare Dhaka - Gulshan',
    address: 'Plot 5, Block A, Gulshan 2, Dhaka',
    position: { lat: 23.8042, lng: 90.4181 },
    rating: 4.8,
    isOpen: true,
    phone: '+880 2 9882234',
    services: ['Oil Change', 'Brake Service', 'Battery Replacement'],
  },
  {
    id: 'garage-2',
    name: 'Premium Car Service Center',
    address: 'Dhanmondi, Dhaka 1205',
    position: { lat: 23.7479, lng: 90.3667 },
    rating: 4.5,
    isOpen: true,
    phone: '+880 1713456789',
    services: ['General Maintenance', 'AC Repair', 'Suspension'],
  },
  {
    id: 'garage-3',
    name: 'Mirpur Auto Garage',
    address: 'Mirpur 12, Dhaka',
    position: { lat: 23.8144, lng: 90.3785 },
    rating: 4.2,
    isOpen: false,
    phone: '+880 1612345678',
    services: ['Tyre Service', 'Engine Repair', 'Welding'],
  },
  {
    id: 'garage-4',
    name: 'Express Car Care',
    address: 'Banani, Dhaka 1213',
    position: { lat: 23.8261, lng: 90.3832 },
    rating: 4.6,
    isOpen: true,
    phone: '+880 1712345678',
    services: ['Quick Service', 'Wash & Polish', 'Detailing'],
  },
  {
    id: 'garage-5',
    name: 'TechAuto Service',
    address: 'Uttara, Dhaka 1230',
    position: { lat: 23.8699, lng: 90.4034 },
    rating: 4.4,
    isOpen: true,
    phone: '+880 1612345679',
    services: ['Computer Diagnosis', 'Electric Repair', 'Paint Job'],
  },
  {
    id: 'garage-6',
    name: 'Motijheel Auto Works',
    address: 'Motijheel, Dhaka 1000',
    position: { lat: 23.7330, lng: 90.4172 },
    rating: 4.3,
    isOpen: true,
    phone: '+880 1812345678',
    services: ['Body Work', 'Paint', 'Dent Removal'],
  },
  {
    id: 'garage-7',
    name: 'Badda Service Station',
    address: 'Badda, Dhaka 1212',
    position: { lat: 23.7805, lng: 90.4267 },
    rating: 4.1,
    isOpen: true,
    phone: '+880 1912345678',
    services: ['Oil Change', 'Tire Rotation', 'Alignment'],
  },
];

const mockDrivers = [
  {
    _id: 'driver-1',
    name: 'Ahmed Hassan',
    location: { latitude: 23.8150, longitude: 90.4200, lastUpdated: new Date() },
    phone: '+880 1911111111',
    rating: 4.9,
    status: 'available',
  },
  {
    _id: 'driver-2',
    name: 'Karim Khan',
    location: { latitude: 23.7550, longitude: 90.3700, lastUpdated: new Date() },
    phone: '+880 1922222222',
    rating: 4.7,
    status: 'available',
  },
  {
    _id: 'driver-3',
    name: 'Rauf Ali',
    location: { latitude: 23.8300, longitude: 90.3900, lastUpdated: new Date() },
    phone: '+880 1933333333',
    rating: 4.6,
    status: 'available',
  },
  {
    _id: 'driver-4',
    name: 'Salam Mia',
    location: { latitude: 23.7900, longitude: 90.4100, lastUpdated: new Date() },
    phone: '+880 1944444444',
    rating: 4.8,
    status: 'available',
  },
];

// Component to update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const LeafletMap = () => {
    const navigate = useNavigate();
  const { user, isOwner, isDriver } = useAuth();
  const [drivers, setDrivers] = useState(mockDrivers);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [nearbyGarages, setNearbyGarages] = useState([]);
  const [dbGarages, setDbGarages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const garagesFetchedRef = useRef(false);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setMapCenter(newLocation);
          toast.success('Location updated successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Using Dhaka as default.');
        }
      );
    } else {
      toast.error('Geolocation not supported by your browser');
    }
  };

  // Fetch drivers from backend
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/drivers/locations');
      console.log('Driver locations response:', response.data);
      if (response.data.drivers && response.data.drivers.length > 0) {
        setDrivers(response.data.drivers);
        toast.success(`Found ${response.data.drivers.length} drivers online`);
      } else {
        setDrivers(mockDrivers);
        toast.success(`Using demo data: ${mockDrivers.length} drivers available`);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers(mockDrivers);
      toast.success(`Demo mode: ${mockDrivers.length} drivers shown`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate driver movement for demo
  const simulateDriverMovement = () => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) => {
        const lat = driver.location?.latitude || driver.location?.lat;
        const lng = driver.location?.longitude || driver.location?.lng;
        return {
          ...driver,
          location: {
            latitude: lat + (Math.random() - 0.5) * 0.003,
            longitude: lng + (Math.random() - 0.5) * 0.003,
            lastUpdated: new Date(),
          },
        };
      })
    );
  };

  // Fetch garages from database
  const fetchGarages = useCallback(async () => {
    if (garagesFetchedRef.current) return;
    garagesFetchedRef.current = true;
    try {
      const response = await api.get('/garages');
      if (response.data.success && response.data.garages) {
        // Convert database garage format to map format
        const formattedGarages = response.data.garages.map(garage => ({
          id: garage._id,
          name: garage.name,
          address: garage.address,
          position: { 
            lat: garage.location.latitude, 
            lng: garage.location.longitude 
          },
          rating: garage.rating,
          isOpen: garage.isOpen,
          phone: garage.phone,
          services: garage.services || [],
          isVerified: garage.isVerified,
        }));
        setDbGarages(formattedGarages);
        console.log(`🏠 Loaded ${formattedGarages.length} approved garages from database:`, formattedGarages.map(g => g.name));
        // Merge with mock garages (keeping existing mock ones)
        const allGarages = [...mockGarages, ...formattedGarages];
        setNearbyGarages(allGarages);
      }
    } catch (error) {
      console.error('Error fetching garages:', error);
      // Fallback to mock garages
      setNearbyGarages(mockGarages);
    }
  }, []);

  // Search nearby garages
  const searchNearbyGarages = () => {
      // Combine mock and database garages
      const allGarages = [...mockGarages, ...dbGarages];
    setLoading(true);
    // Filter garages within 10km radius
    const nearbyFiltered = allGarages.filter(garage => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        garage.position.lat,
        garage.position.lng
      );
      return distance <= 10;
    });
    
    setTimeout(() => {
      setNearbyGarages(nearbyFiltered.length > 0 ? nearbyFiltered : mockGarages);
      setLoading(false);
    }, 500);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // Initialize on mount
  useEffect(() => {
    // Only fetch drivers if user is not a driver (car owners can see drivers)
    if (!isDriver) {
      fetchDrivers();
      const interval = setInterval(simulateDriverMovement, 8000);
      return () => clearInterval(interval);
    }
    getUserLocation();
    fetchGarages();
  }, [fetchDrivers, fetchGarages, isDriver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-0">
      {/* Top bar with logo/back */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-xl font-bold gradient-text flex items-center gap-2"
          >
            🚗 Car Sahajjo
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-500" />
            {isDriver ? 'Service Centers Map' : 'Find Garage and Drivers'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isDriver 
              ? 'Explore nearby garages and service centers for your needs'
              : 'Track drivers in real-time, find nearby garages, and explore service centers'
            }
          </p>
        </motion.div>

        {/* Map Controls */}
        <div className="mb-4 flex flex-wrap gap-4">
          <button
            onClick={getUserLocation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Navigation className="w-4 h-4" />
            My Location
          </button>
          <button
            onClick={searchNearbyGarages}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Wrench className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find Nearby Garages'}
          </button>
          {!isDriver && (
            <button
              onClick={fetchDrivers}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Drivers
            </button>
          )}
          <button
            onClick={() => setMapCenter(userLocation)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Car className="w-4 h-4" />
            Center Map
          </button>
          <button
            onClick={() => navigate('/submit-garage')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <MapPin className="w-4 h-4" />
            Submit Garage
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 glass p-4 rounded-lg flex flex-wrap gap-4 items-center shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm dark:text-white font-semibold">Your Location</span>
          </div>
          {!isDriver && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm dark:text-white font-semibold">
                Drivers Online ({drivers.length})
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm dark:text-white font-semibold">
              Service Centers ({nearbyGarages.length})
            </span>
          </div>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl overflow-hidden shadow-2xl mb-6"
          style={{ height: '600px' }}
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapUpdater center={mapCenter} />
            
            {/* OpenStreetMap Tile Layer - Completely Free! */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">📍 Your Location</h3>
                  <p className="text-sm text-gray-600">You are here</p>
                </div>
              </Popup>
            </Marker>

            {/* Driver Markers - Only show for non-driver users (car owners) */}
            {!isDriver && drivers.map((driver) => {
              const lat = driver.location?.latitude || driver.location?.lat;
              const lng = driver.location?.longitude || driver.location?.lng;
              if (!lat || !lng) return null;
              
              return (
                <Marker
                  key={driver._id}
                  position={[parseFloat(lat), parseFloat(lng)]}
                  icon={driverIcon}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2">🚗 {driver.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Status: <span className="text-green-600 font-semibold">Available</span>
                        </p>
                        <p>
                          ⭐ Rating: <span className="font-semibold">{driver.rating}/5</span>
                        </p>
                        <p>
                          📍 Distance:{' '}
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            parseFloat(lat),
                            parseFloat(lng)
                          )}{' '}
                          km away
                        </p>
                        {driver.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Updated: {new Date(driver.location?.lastUpdated || new Date()).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Garage Markers */}
            {nearbyGarages.map((garage) => (
              <Marker
                key={garage.id}
                position={[garage.position.lat, garage.position.lng]}
                icon={garageIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-bold text-lg mb-2">🔧 {garage.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{garage.address}</p>
                      {garage.rating && (
                        <p>⭐ Rating: <span className="font-semibold">{garage.rating}/5</span></p>
                      )}
                      {garage.isOpen !== undefined && (
                        <p className={garage.isOpen ? 'text-green-600' : 'text-red-600'}>
                          {garage.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                        </p>
                      )}
                      <p>
                        📍 Distance:{' '}
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          garage.position.lat,
                          garage.position.lng
                        )}{' '}
                        km away
                      </p>
                      {garage.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {garage.phone}
                        </p>
                      )}
                      {garage.services && (
                        <div className="mt-2">
                          <p className="font-semibold">Services:</p>
                          <ul className="text-xs list-disc list-inside">
                            {garage.services.slice(0, 3).map((service, idx) => (
                              <li key={idx}>{service}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${garage.position.lat},${garage.position.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-all"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {/* Service Centers List */}
        {nearbyGarages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <Wrench className="w-7 h-7" />
              Nearby Service Centers ({nearbyGarages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyGarages.map((garage) => (
                <div key={garage.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <h4 className="font-bold text-lg dark:text-white mb-2">{garage.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{garage.address}</p>
                  
                  <div className="space-y-2 mb-3">
                    {garage.rating && (
                      <p className="text-sm flex items-center gap-1">
                        ⭐ <span className="font-semibold">{garage.rating}/5</span>
                      </p>
                    )}
                    <p className="text-sm flex items-center gap-1">
                      📍 <span className="font-semibold">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          garage.position.lat,
                          garage.position.lng
                        )} km away
                      </span>
                    </p>
                    {garage.phone && (
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {garage.phone}
                      </p>
                    )}
                  </div>

                  {garage.services && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {garage.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {garage.isOpen !== undefined && (
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        garage.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {garage.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${garage.position.lat},${garage.position.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      Get Directions
                    </a>
                    <button
                      onClick={() => setMapCenter(garage.position)}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
                    >
                      Show on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, TrafficLayer } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Wrench, AlertCircle, RefreshCw, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
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
];

const mockDrivers = [
  {
    _id: 'driver-1',
    name: 'Ahmed Hassan',
    location: { latitude: 23.8150, longitude: 90.4200, lastUpdated: new Date() },
    phone: '+880 1911111111',
    rating: 4.9,
  },
  {
    _id: 'driver-2',
    name: 'Karim Khan',
    location: { latitude: 23.7550, longitude: 90.3700, lastUpdated: new Date() },
    phone: '+880 1922222222',
    rating: 4.7,
  },
  {
    _id: 'driver-3',
    name: 'Rauf Ali',
    location: { latitude: 23.8300, longitude: 90.3900, lastUpdated: new Date() },
    phone: '+880 1933333333',
    rating: 4.6,
  },
];

const libraries = ['places'];

const LiveMap = () => {
  const { user, isOwner, isDriver } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(center);
  const [nearbyGarages, setNearbyGarages] = useState([]);
  const [showTraffic, setShowTraffic] = useState(true);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const garagesFetchedRef = useRef(false);

  // All functions declared FIRST

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          toast.success('Location updated');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Using default location.');
        }
      );
    } else {
      toast.error('Geolocation not supported by your browser');
    }
  };

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get('/users/drivers/locations');
      console.log('Driver locations response:', response.data);
      setDrivers(response.data.drivers || mockDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // Use mock data as fallback
      setDrivers(mockDrivers);
      toast.error('Using demo drivers (offline mode)');
    }
  }, []);

  const mapGarageFromServer = (g) => ({
    id: g._id,
    name: g.name,
    address: g.address,
    position: {
      lat: g.location?.latitude,
      lng: g.location?.longitude,
    },
    rating: g.rating,
    isOpen: g.isOpen,
    phone: g.phone,
  });

  const fetchApprovedGarages = useCallback(async () => {
    if (garagesFetchedRef.current) return;
    garagesFetchedRef.current = true;
    try {
      const res = await api.get('/garages');
      const list = (res.data?.garages || [])
        .filter((g) => g?.location?.latitude && g?.location?.longitude)
        .map(mapGarageFromServer);
      if (list.length > 0) {
        setNearbyGarages(list);
      } else {
        setNearbyGarages(mockGarages);
      }
    } catch (err) {
      console.error('Failed to load garages from server:', err);
      setNearbyGarages(mockGarages);
    }
  }, []);

  const simulateDriverMovement = () => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) => {
        const lat = driver.location?.latitude || driver.location?.lat;
        const lng = driver.location?.longitude || driver.location?.lng;
        return {
          ...driver,
          location: {
            latitude: lat + (Math.random() - 0.5) * 0.001,
            longitude: lng + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date(),
          },
        };
      })
    );
  };

  const searchNearbyGarages = useCallback(() => {
    // Prefer server garages first; fallback to Google Places or demo (only once)
    if (!garagesFetchedRef.current) {
      fetchApprovedGarages();
    }
    // Try to use Google Maps Places API if available
    if (map && window.google) {
      setLoading(true);
      const service = new window.google.maps.places.PlacesService(map);
      
      const request = {
        location: userLocation,
        radius: 5000, // 5km radius
        type: ['car_repair', 'car_dealer'],
        keyword: 'garage auto repair service center',
      };

      service.nearbySearch(request, (results, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const garages = results.slice(0, 10).map((place, index) => ({
            id: `garage-${index}`,
            name: place.name,
            position: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            address: place.vicinity,
            rating: place.rating,
            isOpen: place.opening_hours?.open_now,
          }));
          // Merge with server garages, avoid duplicates by name + location
          setNearbyGarages((prev) => {
            const merged = [...prev];
            garages.forEach((g) => {
              const exists = merged.some(
                (m) => m.name === g.name && Math.abs(m.position.lat - g.position.lat) < 1e-6 && Math.abs(m.position.lng - g.position.lng) < 1e-6
              );
              if (!exists) merged.push(g);
            });
            return merged;
          });
        } else {
          // Fallback to mock data if Google Places fails
          setNearbyGarages(mockGarages);
        }
      });
    } else {
      // No map available, use mock data
      setNearbyGarages(mockGarages);
    }
  }, [map, userLocation, fetchApprovedGarages]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

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

  // NOW useEffect with all functions already declared
  useEffect(() => {
    fetchDrivers();
    getUserLocation();
    // Load approved garages from backend immediately
    fetchApprovedGarages();
    const interval = setInterval(simulateDriverMovement, 5000);
    return () => clearInterval(interval);
  }, [fetchDrivers, fetchApprovedGarages]);

  // Show loading state while Google Maps library is loading
  if (!scriptLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Loading Map...</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please wait while we initialize the map.</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error state if there was a problem
  if (mapError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Map Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              setScriptLoaded(false);
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-500" />
            {isOwner ? 'Find Drivers & Service Centers' : 'Live Map & Service Centers'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isOwner 
              ? 'Discover available drivers and nearby service centers for your car maintenance needs'
              : 'Track drivers in real-time, find nearby garages, and check traffic conditions'
            }
          </p>
        </motion.div>

        {/* Map Controls */}
        <div className="mb-4 flex flex-wrap gap-4">
          <button
            onClick={getUserLocation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Navigation className="w-4 h-4" />
            My Location
          </button>
          <button
            onClick={searchNearbyGarages}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Wrench className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find Nearby Garages'}
          </button>
          <button
            onClick={fetchDrivers}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Drivers
          </button>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-4 py-2 ${
              showTraffic ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white rounded-lg flex items-center gap-2 transition-all`}
          >
            <AlertCircle className="w-4 h-4" />
            {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 glass p-4 rounded-lg flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm dark:text-white">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm dark:text-white">
              {isOwner ? 'Available Drivers' : 'Drivers Online'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm dark:text-white">Service Centers</span>
          </div>
          {showTraffic && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm dark:text-white">Traffic Enabled (Red = Heavy, Yellow = Moderate)</span>
            </div>
          )}
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl overflow-hidden shadow-2xl"
        >
          <LoadScript 
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'} 
            libraries={libraries}
            onLoad={() => {
              console.log('Google Maps API loaded successfully');
              setScriptLoaded(true);
            }}
            onError={(error) => {
              console.error('Failed to load Google Maps API:', error);
              setMapError('Failed to load Google Maps. Please check your internet connection and try again.');
              toast.error('Failed to load map. Please check your internet connection.');
            }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation}
              zoom={13}
              onLoad={onMapLoad}
              options={{
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
                fullscreenControl: true,
              }}
            >
              {/* Traffic Layer */}
              {showTraffic && <TrafficLayer />}

              {/* User Location Marker */}
              <Marker
                position={userLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                onClick={() => setSelectedMarker({ type: 'user', data: { name: 'You' } })}
              />

              {/* Driver Markers */}
              {drivers && drivers.length > 0 && drivers.map((driver) => {
                const lat = driver.location?.latitude || driver.location?.lat;
                const lng = driver.location?.longitude || driver.location?.lng;
                if (!lat || !lng) return null;
                return (
                  <Marker
                    key={driver._id}
                    position={{
                      lat: parseFloat(lat),
                      lng: parseFloat(lng),
                    }}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: new window.google.maps.Size(35, 35),
                    }}
                    onClick={() => setSelectedMarker({ type: 'driver', data: driver })}
                  />
                );
              })}

              {/* Garage Markers - Show for all users */}
              {nearbyGarages.map((garage) => (
                <Marker
                  key={garage.id}
                  position={garage.position}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(35, 35),
                  }}
                  onClick={() => setSelectedMarker({ type: 'garage', data: garage })}
                />
              ))}

              {/* Info Window */}
              {selectedMarker && (
                <InfoWindow
                  position={
                    selectedMarker.type === 'user'
                      ? userLocation
                      : selectedMarker.type === 'driver'
                      ? {
                          lat: parseFloat(selectedMarker.data.location?.latitude || selectedMarker.data.location?.lat),
                          lng: parseFloat(selectedMarker.data.location?.longitude || selectedMarker.data.location?.lng),
                        }
                      : selectedMarker.data.position
                  }
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-1">
                      {selectedMarker.type === 'user'
                        ? '📍 Your Location'
                        : selectedMarker.type === 'driver'
                        ? `🚗 ${selectedMarker.data.name}`
                        : `🔧 ${selectedMarker.data.name}`}
                    </h3>
                    {selectedMarker.type === 'driver' && (
                      <div className="text-sm text-gray-600">
                        <p>Status: <span className="text-green-600 font-semibold">Available</span></p>
                        <p>Distance: {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          parseFloat(selectedMarker.data.location?.latitude || selectedMarker.data.location?.lat),
                          parseFloat(selectedMarker.data.location?.longitude || selectedMarker.data.location?.lng)
                        )} km away</p>
                        <p className="text-xs mt-1">Updated: {new Date(selectedMarker.data.location?.lastUpdated || new Date()).toLocaleTimeString()}</p>
                        {selectedMarker.data.phone && (
                          <p className="mt-1">📞 {selectedMarker.data.phone}</p>
                        )}
                      </div>
                    )}
                    {selectedMarker.type === 'garage' && (
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">{selectedMarker.data.address}</p>
                        {selectedMarker.data.rating && (
                          <p>⭐ Rating: {selectedMarker.data.rating}/5</p>
                        )}
                        {selectedMarker.data.isOpen !== undefined && (
                          <p className={selectedMarker.data.isOpen ? 'text-green-600' : 'text-red-600'}>
                            {selectedMarker.data.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                          </p>
                        )}
                        <p className="mt-1">Distance: {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          selectedMarker.data.position.lat,
                          selectedMarker.data.position.lng
                        )} km away</p>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.data.position.lat},${selectedMarker.data.position.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:underline"
                        >
                          Get Directions →
                        </a>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </motion.div>

        {/* Garage List */}
        {nearbyGarages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
              <Wrench className="w-6 h-6" />
              Nearby Service Centers ({nearbyGarages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyGarages.map((garage) => (
                <div key={garage.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h4 className="font-semibold text-lg dark:text-white mb-2">{garage.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{garage.address}</p>
                  {garage.rating && (
                    <p className="text-sm mb-2">⭐ {garage.rating}/5</p>
                  )}
                  <p className="text-sm mb-2">
                    📍 {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      garage.position.lat,
                      garage.position.lng
                    )} km away
                  </p>
                  {garage.isOpen !== undefined && (
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      garage.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {garage.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${garage.position.lat},${garage.position.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-all"
                  >
                    Get Directions
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;

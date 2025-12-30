import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import api from '../../utils/api';
import { MapPin, Navigation } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 23.8103,
  lng: 90.4125,
};

// Hardcoded garage locations in Dhaka
const garages = [
  { id: 1, name: 'Uttara Auto Service', position: { lat: 23.8759, lng: 90.3795 } },
  { id: 2, name: 'Mirpur Car Center', position: { lat: 23.8223, lng: 90.3654 } },
  { id: 3, name: 'Dhanmondi Motors', position: { lat: 23.7461, lng: 90.3742 } },
  { id: 4, name: 'Gulshan Garage Hub', position: { lat: 23.7806, lng: 90.4172 } },
  { id: 5, name: 'Banani Auto Repair', position: { lat: 23.7937, lng: 90.4066 } },
];

const LiveMap = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(center);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get('/users/drivers/locations');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  // Simulate driver movement by randomly updating lat/lng
  const simulateDriverMovement = () => {
    setDrivers((prevDrivers) =>
      prevDrivers.map((driver) => ({
        ...driver,
        location: {
          latitude: driver.location.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: driver.location.longitude + (Math.random() - 0.5) * 0.0001,
          lastUpdated: new Date(),
        },
      }))
    );
  };

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(simulateDriverMovement, 3000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

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
            Live Map & Service Centers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track drivers in real-time and find nearby garages
          </p>
        </motion.div>

        {/* Map Controls */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={getUserLocation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Navigation className="w-4 h-4" />
            My Location
          </button>
          <button
            onClick={fetchDrivers}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Refresh Drivers
          </button>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl overflow-hidden shadow-2xl"
        >
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation}
              zoom={12}
              options={{
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }],
                  },
                ],
              }}
            >
              {/* User Location Marker */}
              <Marker
                position={userLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                }}
                onClick={() => setSelectedMarker({ type: 'user', data: { name: 'You' } })}
              />

              {/* Driver Markers */}
              {drivers.map((driver) => (
                <Marker
                  key={driver._id}
                  position={{
                    lat: driver.location.latitude,
                    lng: driver.location.longitude,
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  }}
                  onClick={() => setSelectedMarker({ type: 'driver', data: driver })}
                />
              ))}

              {/* Garage Markers */}
              {garages.map((garage) => (
                <Marker
                  key={garage.id}
                  position={garage.position}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
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
                          lat: selectedMarker.data.location.latitude,
                          lng: selectedMarker.data.location.longitude,
                        }
                      : selectedMarker.data.position
                  }
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">
                      {selectedMarker.type === 'user'
                        ? 'Your Location'
                        : selectedMarker.type === 'driver'
                        ? selectedMarker.data.name
                        : selectedMarker.data.name}
                    </h3>
                    {selectedMarker.type === 'driver' && (
                      <p className="text-sm text-gray-600">
                        Available Driver
                        <br />
                        Last updated: {new Date(selectedMarker.data.location.lastUpdated).toLocaleTimeString()}
                      </p>
                    )}
                    {selectedMarker.type === 'garage' && (
                      <p className="text-sm text-gray-600">Service Center</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass p-6 rounded-xl"
        >
          <h3 className="text-xl font-bold mb-4 dark:text-white">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500"></div>
              <span className="dark:text-white">Your Location</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
              <span className="dark:text-white">Available Drivers ({drivers.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500"></div>
              <span className="dark:text-white">Service Centers ({garages.length})</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveMap;

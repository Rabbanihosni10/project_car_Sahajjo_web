import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, X, Eye, Plus, Trash2, Edit, Phone, Mail, Globe, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ManageGarages = () => {
  const navigate = useNavigate();
  const [pendingGarages, setPendingGarages] = useState([]);
  const [approvedGarages, setApprovedGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/garages/admin/pending'),
        api.get('/garages'),
      ]);

      if (pendingRes.data.success) {
        setPendingGarages(pendingRes.data.garages);
      }
      if (approvedRes.data.success) {
        setApprovedGarages(approvedRes.data.garages);
      }
    } catch (error) {
      console.error('Error fetching garages:', error);
      toast.error('Failed to fetch garages');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await api.put(`/garages/${id}/approve`);
      if (response.data.success) {
        toast.success('Garage approved successfully!');
        fetchGarages();
      }
    } catch (error) {
      console.error('Error approving garage:', error);
      toast.error('Failed to approve garage');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await api.put(`/garages/${id}/reject`);
      if (response.data.success) {
        toast.success('Garage rejected');
        fetchGarages();
      }
    } catch (error) {
      console.error('Error rejecting garage:', error);
      toast.error('Failed to reject garage');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this garage?')) return;
    
    try {
      const response = await api.delete(`/garages/${id}`);
      if (response.data.success) {
        toast.success('Garage deleted successfully');
        fetchGarages();
      }
    } catch (error) {
      console.error('Error deleting garage:', error);
      toast.error('Failed to delete garage');
    }
  };

  const viewDetails = (garage) => {
    setSelectedGarage(garage);
    setShowModal(true);
  };

  const GarageCard = ({ garage, isPending }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-xl shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold dark:text-white mb-1">{garage.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{garage.address}</p>
        </div>
        {garage.isVerified && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Verified
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <p className="dark:text-gray-300">
          📍 Location: {garage.location.latitude.toFixed(4)}, {garage.location.longitude.toFixed(4)}
        </p>
        {garage.phone && (
          <p className="dark:text-gray-300 flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {garage.phone}
          </p>
        )}
        {garage.submittedBy && (
          <p className="text-gray-600 dark:text-gray-400">
            Submitted by: {garage.submittedBy.name || garage.submittedBy.email}
          </p>
        )}
        {garage.services && garage.services.length > 0 && (
          <div>
            <p className="font-semibold dark:text-white">Services:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {garage.services.map((service, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => viewDetails(garage)}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        
        {isPending ? (
          <>
            <button
              onClick={() => handleApprove(garage._id)}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleReject(garage._id)}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={() => handleDelete(garage._id)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 dark:text-white flex items-center gap-3">
            <MapPin className="w-10 h-10 text-blue-500" />
            Manage Garages
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review submissions and manage garage locations
          </p>
        </div>

        {/* Add New Garage Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/garages/add')}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add New Garage
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pending ({pendingGarages.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'approved'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Approved ({approvedGarages.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'pending' ? (
              pendingGarages.length > 0 ? (
                pendingGarages.map((garage) => (
                  <GarageCard key={garage._id} garage={garage} isPending={true} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-400">
                  No pending submissions
                </div>
              )
            ) : (
              approvedGarages.length > 0 ? (
                approvedGarages.map((garage) => (
                  <GarageCard key={garage._id} garage={garage} isPending={false} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-400">
                  No approved garages
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedGarage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold dark:text-white">{selectedGarage.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold dark:text-white">Address:</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedGarage.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold dark:text-white">Latitude:</p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.location.latitude}</p>
                </div>
                <div>
                  <p className="font-semibold dark:text-white">Longitude:</p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.location.longitude}</p>
                </div>
              </div>

              {selectedGarage.phone && (
                <div>
                  <p className="font-semibold dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.phone}</p>
                </div>
              )}

              {selectedGarage.email && (
                <div>
                  <p className="font-semibold dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.email}</p>
                </div>
              )}

              {selectedGarage.website && (
                <div>
                  <p className="font-semibold dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Website:
                  </p>
                  <a
                    href={selectedGarage.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {selectedGarage.website}
                  </a>
                </div>
              )}

              {selectedGarage.openingHours && (
                <div>
                  <p className="font-semibold dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Opening Hours:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.openingHours}</p>
                </div>
              )}

              {selectedGarage.description && (
                <div>
                  <p className="font-semibold dark:text-white">Description:</p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedGarage.description}</p>
                </div>
              )}

              {selectedGarage.services && selectedGarage.services.length > 0 && (
                <div>
                  <p className="font-semibold dark:text-white">Services:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGarage.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGarage.submittedBy && (
                <div>
                  <p className="font-semibold dark:text-white">Submitted By:</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedGarage.submittedBy.name || selectedGarage.submittedBy.email}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-all"
              >
                Close
              </button>
              {selectedGarage.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedGarage._id);
                      setShowModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedGarage._id);
                      setShowModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageGarages;

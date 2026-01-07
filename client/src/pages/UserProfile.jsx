import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Badge, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data.user || response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <nav className="glass-dark border-b border-white/10">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">User Profile</h1>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">User not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold gradient-text">User Profile</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col items-center -mt-16 mb-6">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
                  {profile.name?.charAt(0) || '?'}
                </div>
              )}
              <h1 className="text-3xl font-bold mt-4 dark:text-white text-center">{profile.name}</h1>
              
              {/* Role Badge */}
              <div className="flex items-center gap-2 mt-2">
                <Badge className="w-5 h-5 text-blue-500" />
                <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold capitalize">
                  {profile.role}
                </span>
              </div>

              {/* Verification Status */}
              {profile.isApproved && (
                <div className="mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                  ✓ Verified
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6 space-y-4">
              <h2 className="text-xl font-bold dark:text-white mb-4">Contact Information</h2>

              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-gray-900 dark:text-white font-semibold hover:text-blue-500 break-all"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-gray-900 dark:text-white font-semibold hover:text-green-500"
                    >
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}

              {profile.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{profile.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {(profile.licenseInfo || profile.kycDocuments) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
                <h2 className="text-lg font-bold dark:text-white mb-4">Verification Details</h2>

                {profile.licenseInfo?.licenseNumber && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">License Number</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{profile.licenseInfo.licenseNumber}</p>
                  </div>
                )}

                {profile.kycDocuments?.verificationStatus && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">KYC Status</p>
                    <p className={`font-semibold capitalize ${
                      profile.kycDocuments.verificationStatus === 'verified'
                        ? 'text-green-600 dark:text-green-400'
                        : profile.kycDocuments.verificationStatus === 'pending'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {profile.kycDocuments.verificationStatus}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!isOwnProfile && (
                <Link
                  to={`/messages/${profile._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-semibold"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message
                </Link>
              )}
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-all font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;

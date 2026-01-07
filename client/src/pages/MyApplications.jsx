import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, MapPin, DollarSign, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/my/applications');
      const apps = Array.isArray(response.data.applications) ? response.data.applications : response.data.data || [];
      setApplications(apps);
    } catch {
      console.log('Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            📋 My Applications
          </Link>
          <Link to="/jobs" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            Find More Jobs
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white">Job Applications</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your job applications and statuses</p>
        </motion.div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No applications yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Start exploring job opportunities</p>
            <Link to="/jobs" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-block">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <motion.div
                key={app._id || Math.random()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold dark:text-white">{app.job?.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getStatusColor(app.applicationStatus)}`}>
                        {getStatusIcon(app.applicationStatus)}
                        {app.applicationStatus?.charAt(0).toUpperCase() + app.applicationStatus?.slice(1) || 'Pending'}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Job</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{app.job?.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-bold">৳{app.job?.salary?.toLocaleString()}/month</span>
                      </div>
                    </div>

                    {app.job?.carModel && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-semibold dark:text-white">Car Model: <span className="font-normal">{app.job.carModel}</span></p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.job?.owner && (
                        <span>• Employer: {app.job.owner.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                {app.applicationStatus === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-700">
                    <p className="text-green-800 dark:text-green-200 font-semibold">✓ Congratulations! Your application was accepted.</p>
                    {app.job?.owner?.phone && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-2">Contact: {app.job.owner.phone}</p>
                    )}
                    {app.job?.owner?._id && (
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/users/${app.job.owner._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                        >
                          View Employer
                        </Link>
                        <Link
                          to={`/messages/${app.job.owner._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message Employer
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {app.applicationStatus === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
                    <p className="text-red-800 dark:text-red-200 font-semibold">Application not selected</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-2">Keep applying to other opportunities!</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

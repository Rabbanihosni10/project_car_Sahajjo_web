import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, Mail, Phone, Calendar, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/my/posted');
      console.log('Jobs response:', response.data);
      const jobsData = response.data.jobs || response.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId, applicationId, status) => {
    try {
      await api.put(`/jobs/${jobId}/applications/${applicationId}`, { status });
      toast.success(`Application ${status}`);
      fetchMyJobs();
    } catch (error) {
      toast.error('Failed to update application status');
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            💼 My Job Posts
          </Link>
          <Link
            to="/jobs/create"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Post New Job
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
          <h1 className="text-4xl font-bold mb-2 dark:text-white">My Job Posts</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your job postings and review applications
          </p>
        </motion.div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No jobs posted yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start by creating your first job posting
            </p>
            <Link
              to="/jobs/create"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>📍 {job.location}</span>
                      <span>💰 ৳{job.salary.toLocaleString()}/month</span>
                      <span>🚗 {job.carModel}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                    {job.jobType}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>

                {/* Applications Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Applications ({job.applications?.length || 0})
                  </h4>

                  {job.applications && job.applications.length > 0 ? (
                    <div className="space-y-4">
                      {job.applications.map((app) => (
                        <div
                          key={app._id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                              {app.driver?.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <h5 className="font-semibold dark:text-white">{app.driver?.name || 'Unknown'}</h5>
                              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                {app.driver?.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {app.driver.email}
                                  </span>
                                )}
                                {app.driver?.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {app.driver.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {app.message && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                  "{app.message}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}>
                              {app.status}
                            </span>
                            <Link
                              to={`/users/${app.driver?._id}`}
                              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                              title="View Details"
                            >
                              <User className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/messages/${app.driver?._id}`}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                              title="Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                            {app.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(job._id, app._id, 'accepted')}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                                  title="Accept"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(job._id, app._id, 'rejected')}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No applications yet. Share this job to get applicants!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;

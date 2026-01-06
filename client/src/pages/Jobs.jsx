import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user, isOwner, isDriver } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      setJobs(response.data.jobs);
    } catch {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const applyForJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`, {
        message: 'I am interested in this position',
      });
      toast.success('Application submitted successfully!');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold gradient-text">
            💼 Jobs
          </Link>
          {isOwner && (
            <Link
              to="/jobs/create"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 dark:text-white">
            Driver Job Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find the perfect driving job for you
          </p>
        </motion.div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2 dark:text-white">No jobs available</h3>
            <p className="text-gray-600 dark:text-gray-300">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const hasApplied = job.applications?.some(
                app => app.driver._id === user?.id
              );

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold dark:text-white">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          job.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm">{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-bold">৳{job.salary.toLocaleString()}/month</span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {job.description}
                      </p>

                      <div className="mb-4">
                        <h4 className="font-bold dark:text-white mb-2">Car Model:</h4>
                        <p className="text-gray-600 dark:text-gray-300">{job.carModel}</p>
                      </div>

                      {job.requirements && (
                        <div className="mb-4">
                          <h4 className="font-bold dark:text-white mb-2">Requirements:</h4>
                          <p className="text-gray-600 dark:text-gray-300">{job.requirements}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <span>•</span>
                        <span>{job.applications?.length || 0} applicants</span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col items-end gap-4">
                      {job.owner?.photo ? (
                        <img
                          src={job.owner.photo}
                          alt={job.owner.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-bold dark:text-white">{job.owner?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Owner</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex-1 text-center px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      View Details
                    </Link>
                    
                    {isDriver && (
                      <button
                        onClick={() => applyForJob(job._id)}
                        disabled={hasApplied || job.status !== 'open'}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          hasApplied || job.status !== 'open'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                      >
                        {hasApplied ? 'Already Applied' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

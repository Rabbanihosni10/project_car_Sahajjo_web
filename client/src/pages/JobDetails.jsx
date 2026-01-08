import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDriver, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job || response.data);
    } catch (error) {
      console.error('Failed to fetch job', error);
      toast.error(error.response?.data?.message || 'Failed to load job');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id, fetchJob]);

  const hasApplied = job?.applications?.some(
    (app) => app.driver?._id === (user?._id || user?.id)
  );

  const handleApply = async () => {
    if (!isDriver) {
      toast.error('Only drivers can apply for jobs');
      return;
    }
    try {
      setApplying(true);
      await api.post(`/jobs/${id}/apply`, { message: 'I am interested in this position' });
      toast.success('Application submitted successfully');
      fetchJob();
    } catch (error) {
      console.error('Apply error', error);
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Briefcase className="w-7 h-7" />
            Job Details
          </h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold dark:text-white">{job.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />৳{job.salary?.toLocaleString()}/month</span>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{job.jobType}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" />Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {isDriver && (
              <button
                onClick={handleApply}
                disabled={hasApplied || job.status !== 'open' || applying}
                className={`px-5 py-3 rounded-lg text-white transition-all ${
                  hasApplied || job.status !== 'open' || applying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {hasApplied ? 'Already Applied' : applying ? 'Submitting...' : 'Apply Now'}
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-xl font-semibold dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.description}</p>
              </section>

              {job.requirements && (
                <section>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Requirements</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.requirements}</p>
                </section>
              )}

              {job.carModel && (
                <section>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Car Model</h3>
                  <p className="text-gray-700 dark:text-gray-300">{job.carModel}</p>
                </section>
              )}

              {job.interviewDate && (
                <section>
                  <h3 className="text-xl font-semibold dark:text-white mb-2">Interview Date</h3>
                  <p className="text-gray-700 dark:text-gray-300">{new Date(job.interviewDate).toLocaleString()}</p>
                </section>
              )}
            </div>

            <aside className="glass rounded-xl p-4 space-y-4">
              <h4 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                <User className="w-5 h-5" /> Posted By
              </h4>
              <div className="flex items-center gap-3">
                {job.owner?.photo ? (
                  <img src={job.owner.photo} alt={job.owner.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-lg">
                    {job.owner?.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold dark:text-white">{job.owner?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Car Owner</p>
                </div>
              </div>
              {job.owner?.phone && (
                <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" /> {job.owner.phone}
                </p>
              )}
              {job.owner?.email && (
                <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" /> {job.owner.email}
                </p>
              )}
              <Link
                to={`/messages/${job.owner?._id}`}
                className="w-full text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Message Owner
              </Link>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;

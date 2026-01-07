import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    jobType: 'fulltime',
    location: '',
    salary: '',
    description: '',
    carModel: '',
    requirements: '',
  });

  const jobTypes = ['fulltime', 'parttime', 'contract', 'temporary'];

  const onChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Job title is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.salary || Number(form.salary) <= 0) newErrors.salary = 'Salary must be greater than 0';
    if (!form.description.trim()) newErrors.description = 'Job description is required';
    if (!form.carModel.trim()) newErrors.carModel = 'Car model is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        jobType: form.jobType,
        location: form.location.trim(),
        salary: Number(form.salary),
        description: form.description.trim(),
        carModel: form.carModel.trim(),
        requirements: form.requirements.trim() || undefined,
      };

      await api.post('/jobs', payload);
      toast.success('Job posted successfully!');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/jobs" className="text-2xl font-bold gradient-text">💼 Post a Job</Link>
          <Link to="/jobs" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-3xl font-bold mb-6 dark:text-white">Find a Driver</motion.h1>
        <form onSubmit={onSubmit} className="glass p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Job Title *</label>
              <input value={form.title} onChange={e=>onChange('title', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.title ? 'border-red-500' : ''}`} placeholder="e.g., Delivery Driver, Taxi Driver" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Job Type</label>
              <select value={form.jobType} onChange={e=>onChange('jobType', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white">
                {jobTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Location *</label>
              <input value={form.location} onChange={e=>onChange('location', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.location ? 'border-red-500' : ''}`} placeholder="Dhaka, Chittagong, etc." />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Monthly Salary (৳) *</label>
              <input type="number" value={form.salary} onChange={e=>onChange('salary', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.salary ? 'border-red-500' : ''}`} />
              {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Car Model *</label>
              <input value={form.carModel} onChange={e=>onChange('carModel', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.carModel ? 'border-red-500' : ''}`} placeholder="Toyota Camry, Honda Civic, etc." />
              {errors.carModel && <p className="text-red-500 text-xs mt-1">{errors.carModel}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Job Description *</label>
            <textarea value={form.description} onChange={e=>onChange('description', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.description ? 'border-red-500' : ''}`} rows={4} placeholder="Describe the job responsibilities, requirements, and any other details..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Requirements (Optional)</label>
            <textarea value={form.requirements} onChange={e=>onChange('requirements', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white" rows={3} placeholder="Driving license type, experience required, language skills, etc." />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all">
            {loading? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;

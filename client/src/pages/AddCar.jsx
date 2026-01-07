import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Image as ImageIcon, X } from 'lucide-react';
import api from '../utils/api';

const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState(['', '', '']);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: 'petrol',
    transmission: 'manual',
    color: '',
    description: '',
    isForSale: false,
    isForRent: false,
    hourly: '',
    daily: '',
    image1: '',
    image2: '',
    image3: '',
  });

  const currentYear = new Date().getFullYear();
  const minYear = 1990;

  const onChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleImageInput = (index, value) => {
    const key = `image${index + 1}`;
    onChange(key, value);
    setImagePreviews(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.brand.trim()) newErrors.brand = 'Brand is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.year || Number(form.year) < minYear || Number(form.year) > currentYear) {
      newErrors.year = `Year must be between ${minYear} and ${currentYear}`;
    }
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.mileage && Number(form.mileage) < 0) newErrors.mileage = 'Mileage cannot be negative';
    
    if (!form.isForSale && !form.isForRent) {
      newErrors.listing = 'Select at least "For Sale" or "For Rent"';
    }
    
    if (form.isForRent) {
      if (!form.hourly || Number(form.hourly) <= 0) newErrors.hourly = 'Hourly rate required and must be > 0';
      if (!form.daily || Number(form.daily) <= 0) newErrors.daily = 'Daily rate required and must be > 0';
    }

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
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : 0,
        fuelType: form.fuelType,
        transmission: form.transmission,
        color: form.color.trim() || undefined,
        description: form.description.trim() || undefined,
        isForSale: !!form.isForSale,
        isForRent: !!form.isForRent,
        rentalRates: form.isForRent ? {
          hourly: Number(form.hourly),
          daily: Number(form.daily),
        } : undefined,
        images: [form.image1, form.image2, form.image3].filter(Boolean),
      };

      const { data } = await api.post('/cars', payload);
      toast.success('Car added successfully');
      navigate(`/cars/${data.car._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/cars" className="text-2xl font-bold gradient-text">🚗 Car Sahajjo</Link>
          <Link to="/cars" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Back</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-3xl font-bold mb-6 dark:text-white">Add a Car</motion.h1>
        <form onSubmit={onSubmit} className="glass p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Brand *</label>
              <input value={form.brand} onChange={e=>onChange('brand', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.brand ? 'border-red-500' : ''}`} placeholder="Toyota, Honda, etc." />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Model *</label>
              <input value={form.model} onChange={e=>onChange('model', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.model ? 'border-red-500' : ''}`} placeholder="Camry, Civic, etc." />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Year * ({minYear} - {currentYear})</label>
              <input type="number" value={form.year} onChange={e=>onChange('year', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.year ? 'border-red-500' : ''}`} />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Price (৳) *</label>
              <input type="number" value={form.price} onChange={e=>onChange('price', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.price ? 'border-red-500' : ''}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Mileage (km)</label>
              <input type="number" value={form.mileage} onChange={e=>onChange('mileage', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.mileage ? 'border-red-500' : ''}`} />
              {errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Color</label>
              <input value={form.color} onChange={e=>onChange('color', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white" placeholder="White, Black, Silver, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Fuel Type</label>
              <select value={form.fuelType} onChange={e=>onChange('fuelType', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white">
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Transmission</label>
              <select value={form.transmission} onChange={e=>onChange('transmission', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white">
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
            <textarea value={form.description} onChange={e=>onChange('description', e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white" rows={3} placeholder="Car condition, features, history, etc." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <label className="flex items-center gap-2 dark:text-gray-200 cursor-pointer">
              <input type="checkbox" checked={form.isForSale} onChange={e=>onChange('isForSale', e.target.checked)} className="w-4 h-4" />
              <span>For Sale</span>
            </label>
            <label className="flex items-center gap-2 dark:text-gray-200 cursor-pointer">
              <input type="checkbox" checked={form.isForRent} onChange={e=>onChange('isForRent', e.target.checked)} className="w-4 h-4" />
              <span>For Rent</span>
            </label>
          </div>
          {errors.listing && <p className="text-red-500 text-xs">{errors.listing}</p>}

          {form.isForRent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Hourly Rate (৳) *</label>
                <input type="number" value={form.hourly} onChange={e=>onChange('hourly', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.hourly ? 'border-red-500' : ''}`} />
                {errors.hourly && <p className="text-red-500 text-xs mt-1">{errors.hourly}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Daily Rate (৳) *</label>
                <input type="number" value={form.daily} onChange={e=>onChange('daily', e.target.value)} className={`w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white ${errors.daily ? 'border-red-500' : ''}`} />
                {errors.daily && <p className="text-red-500 text-xs mt-1">{errors.daily}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-3 dark:text-gray-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Car Images (URLs)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(idx => (
                <div key={idx}>
                  <div className="relative mb-2 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    {imagePreviews[idx] ? (
                      <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" onError={()=>setImagePreviews(prev=>{const u=[...prev]; u[idx]=''; return u;})} />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-400 mt-1">Image {idx + 1}</p>
                      </div>
                    )}
                  </div>
                  <input value={form[`image${idx + 1}`]} onChange={e=>handleImageInput(idx, e.target.value)} placeholder={`Image URL ${idx + 1}`} className="w-full px-3 py-2 text-sm rounded-lg border dark:bg-gray-800 dark:text-white" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Paste image URLs (e.g., https://example.com/car.jpg). Images display as you type.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all">
            {loading? 'Saving...' : 'Save Car'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;

import { Link, useNavigate } from 'react-router-dom';
import { Car, Users, MapPin, ShoppingBag, MessageCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Car className="w-12 h-12" />,
      title: 'Rent a Car',
      description: 'Find the perfect car for your needs with flexible rates',
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Hire a Driver',
      description: 'Connect with professional, verified drivers',
    },
    {
      icon: <MapPin className="w-12 h-12" />,
      title: 'Find Services',
      description: 'Locate nearby garages and service centers',
    },
    {
      icon: <ShoppingBag className="w-12 h-12" />,
      title: 'Marketplace',
      description: 'Buy car parts and accessories',
    },
    {
      icon: <MessageCircle className="w-12 h-12" />,
      title: 'Community',
      description: 'Join discussions with car enthusiasts',
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Verified & Secure',
      description: 'KYC verified users and secure payments',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="glass-dark fixed top-0 w-full z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold gradient-text"
          >
            🚗 Car Sahajjo
          </motion.div>
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-gray-700 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-all"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-all"
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 text-gray-700 dark:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
          >
            Your Complete Car Service Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Rent cars, hire drivers, find services, and connect with the automotive community
            - all in one place!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => navigate('/register?role=owner')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Rent Your Car
            </button>
            <button
              onClick={() => navigate('/register?role=driver')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all border-2 border-blue-500"
            >
              Join as Driver
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 gradient-text"
          >
            Everything You Need
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-8 rounded-2xl hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-dark p-12 rounded-3xl"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of car owners and drivers already using Car Sahajjo
            </p>
            <Link
              to="/register"
              className="inline-block px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Sign Up Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2026 Car Sahajjo. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link to="/about" className="hover:text-blue-400 transition-all">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-blue-400 transition-all">
              Contact Us
            </Link>
            <Link to="/login" className="hover:text-blue-400 transition-all">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-400 transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

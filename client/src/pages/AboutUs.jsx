import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Users, Shield, Clock, Award, Target, Heart, Zap } from 'lucide-react';

const AboutUs = () => {
  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Wide Network",
      description: "Connect with thousands of verified drivers and car owners across Bangladesh"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trusted & Secure",
      description: "All users are verified to ensure safe and reliable services"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Find drivers and services anytime, anywhere with our platform"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Service",
      description: "Ratings and reviews system ensures top-quality service delivery"
    }
  ];

  const values = [
    {
      icon: <Target className="w-12 h-12" />,
      title: "Our Mission",
      description: "To revolutionize car services in Bangladesh by connecting car owners with professional drivers seamlessly."
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Our Vision",
      description: "Building a sustainable ecosystem where car owners and drivers thrive together in a trusted community."
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Our Values",
      description: "Trust, transparency, efficiency, and customer satisfaction drive everything we do."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "5,000+", label: "Verified Drivers" },
    { number: "50,000+", label: "Jobs Completed" },
    { number: "4.8/5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold gradient-text">
            🚗 Car Sahajjo
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-white hover:text-blue-300 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 dark:text-white">
            About <span className="gradient-text">Car Sahajjo</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bangladesh's most trusted platform connecting car owners with professional drivers, 
            making car services accessible, reliable, and efficient.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl text-center"
            >
              <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-10 rounded-2xl mb-20"
        >
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Our Story</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            <p>
              Car Sahajjo was born from a simple observation: car owners in Bangladesh struggle to find 
              reliable drivers, while professional drivers struggle to find consistent work opportunities. 
              We saw an opportunity to bridge this gap with technology.
            </p>
            <p>
              Founded in 2024, our platform has grown to become the largest network of car owners and 
              drivers in Bangladesh. We've facilitated thousands of connections, helping car owners find 
              trusted drivers for their daily needs, special occasions, and business purposes.
            </p>
            <p>
              Beyond connecting drivers and owners, we've built a comprehensive ecosystem that includes 
              a marketplace for car parts and accessories, a community forum for automotive enthusiasts, 
              real-time location tracking, and service center locators. We're constantly innovating to 
              make car ownership and driving services more convenient.
            </p>
          </div>
        </motion.div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass p-8 rounded-2xl text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6 text-white">
                {value.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass p-6 rounded-xl hover:shadow-2xl transition-all"
              >
                <div className="text-blue-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass p-10 rounded-2xl text-center"
        >
          <Users className="w-16 h-16 mx-auto mb-6 text-blue-500" />
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Built by Passionate Team</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Our team consists of automotive enthusiasts, experienced software engineers, and 
            customer service professionals dedicated to transforming the car service industry 
            in Bangladesh.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
          >
            Get in Touch
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default AboutUs;

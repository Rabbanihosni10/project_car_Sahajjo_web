import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import ContactFormCard from '../components/ContactFormCard';

const ContactUs = () => {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: ["+880 1234-567890", "+880 1987-654321"],
      color: "text-green-500"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: ["support@carsahajjo.com", "info@carsahajjo.com"],
      color: "text-blue-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address",
      details: ["123 Gulshan Avenue", "Dhaka 1212, Bangladesh"],
      color: "text-red-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 4PM"],
      color: "text-purple-500"
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-6 h-6" />, name: "Facebook", url: "#", color: "hover:text-blue-600" },
    { icon: <Twitter className="w-6 h-6" />, name: "Twitter", url: "#", color: "hover:text-blue-400" },
    { icon: <Instagram className="w-6 h-6" />, name: "Instagram", url: "#", color: "hover:text-pink-600" }
  ];

  const faqs = [
    {
      question: "How do I register as a driver?",
      answer: "Click on 'Sign Up' and select the Driver option. Complete the registration form with your details and required documents."
    },
    {
      question: "Is the service available 24/7?",
      answer: "Yes! Our platform is available 24/7, and you can find drivers at any time based on their availability."
    },
    {
      question: "How do I verify my account?",
      answer: "After registration, our team will review your documents and verify your account within 24-48 hours."
    }
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
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 dark:text-white">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl text-center hover:shadow-2xl transition-all"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-gray-800 mb-4 ${info.color}`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 dark:text-white">{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-gray-600 dark:text-gray-300 text-sm">
                  {detail}
                </p>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}





          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-2xl"
          >
            <ContactFormCard />
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="glass p-8 rounded-2xl">
              <h2 className="text-3xl font-bold mb-6 dark:text-white">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <h3 className="text-lg font-bold mb-2 dark:text-white">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Connect With Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 ${social.color} transition-all hover:scale-110`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-6">
                Follow us on social media for the latest updates, tips, and community stories.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Map Section (Optional - can add Google Maps later) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 rounded-2xl text-center"
        >
          <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-2xl font-bold mb-4 dark:text-white">Visit Our Office</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're located in the heart of Dhaka. Drop by for a chat!
          </p>
          <p className="text-lg font-semibold dark:text-white">
            123 Gulshan Avenue, Dhaka 1212, Bangladesh
          </p>
        </motion.div>
      </section>

    </div>
  );
};

export default ContactUs;

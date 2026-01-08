import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <h2 className="text-3xl font-bold dark:text-white">Send us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-white">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-white">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+880 1234-567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
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

      {/* Footer */}
      <footer className="glass-dark border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-300">
            © 2026 Car Sahajjo. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-all">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-all">
              Contact
            </Link>
            <Link to="/login" className="text-gray-300 hover:text-blue-400 transition-all">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;

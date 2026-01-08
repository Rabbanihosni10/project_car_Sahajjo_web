import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Footer = () => {
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Cars', to: '/cars' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'AI Chat', to: '/assistant/chat' },
    { label: 'Translator', to: '/assistant/translate' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-3 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-bold gradient-text">🚗 Car Sahajjo</h3>
          <p className="mt-3 text-sm text-white/80">
            Reliable car service, rentals, drivers, jobs, and an AI-powered experience tailored for Bangladesh.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-sm text-white/80">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">Explore</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/85 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">Support</h4>
          <p className="text-sm text-white/80">Dhaka, Bangladesh</p>
          <p className="text-sm text-white/80">support@carsahajjo.com</p>
          <p className="text-sm text-white/80">+880 1234-567-890</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/80">
        © 2026 Car Sahajjo. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`);
    window.open(`mailto:support@carsahajjo.com?subject=${subject}&body=${body}`, '_blank');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="w-full bg-black py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-dark border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </span>
          <div>
            <p className="text-sm text-white/70">We usually respond within a few hours.</p>
            <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="rounded-lg bg-white/10 border border-white/15 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-lg bg-white/10 border border-white/15 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message"
            rows={1}
            className="md:col-span-2 rounded-lg bg-white/10 border border-white/15 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            required
          />
          <button
            type="submit"
            className="md:col-span-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 font-semibold py-3 hover:bg-gray-100 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;

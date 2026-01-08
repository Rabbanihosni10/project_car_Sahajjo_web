import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const ContactFormCard = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    const subject = encodeURIComponent(form.subject || `Contact from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`);
    window.open(`mailto:support@carsahajjo.com?subject=${subject}&body=${body}`, '_blank');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="glass-dark border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </span>
        <div>
          <p className="text-sm text-white/70">We usually respond within a few hours.</p>
          <h3 className="text-xl font-semibold text-white">Contact Us</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject (optional)"
          className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your message"
          rows={4}
          className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          required
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 font-semibold py-2 hover:bg-gray-100 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactFormCard;

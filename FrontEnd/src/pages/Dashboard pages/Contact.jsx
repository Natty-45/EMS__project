import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Reveal from '../../components/ui/Reveal';
import GradientText from '../../components/ui/GradientText';
import { PaperAirplaneIcon, MapPinIcon, EnvelopeIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Contact() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPinIcon className="h-6 w-6 text-brand-500" />,
      title: 'Visit Us',
      text: '123 Event Street, City, Country',
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6 text-brand-500" />,
      title: 'Email Us',
      text: 'info@ems.com',
    },
    {
      icon: <PhoneIcon className="h-6 w-6 text-brand-500" />,
      title: 'Call Us',
      text: '+123 456 7890',
    },
    {
      icon: <ClockIcon className="h-6 w-6 text-brand-500" />,
      title: 'Working Hours',
      text: 'Mon – Fri, 9:00 AM – 6:00 PM',
    },
  ];

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Get in touch
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              <GradientText>Contact Us</GradientText>
            </h1>
            <p className={`mx-auto mt-4 max-w-xl text-lg ${theme.textSecondary}`}>
              Have a question or want to plan your next event? We'd love to hear from you.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact info cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {contactInfo.map((info, index) => (
              <Reveal key={index} direction="left" delay={index * 0.1}>
                <div className={`group flex items-start gap-4 rounded-2xl ${theme.card} border ${theme.border} p-5 card-hover`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 transition-transform duration-300 group-hover:scale-110">
                    {info.icon}
                  </span>
                  <div>
                    <h3 className={`font-display text-sm font-bold ${theme.text}`}>{info.title}</h3>
                    <p className={`mt-1 text-sm ${theme.textSecondary}`}>{info.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Form */}
          <Reveal direction="right" delay={0.15} className="lg:col-span-3">
            <motion.div
              className={`relative overflow-hidden rounded-[2rem] ${theme.card} border ${theme.border} p-8 shadow-2xl shadow-brand-500/5 sm:p-10`}
              whileHover={{ boxShadow: '0 25px 60px -15px rgba(51,97,255,0.25)' }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-10 blur-2xl" />
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={`mb-2 block text-sm font-semibold ${theme.text}`}>Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={`mb-2 block text-sm font-semibold ${theme.text}`}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="message" className={`mb-2 block text-sm font-semibold ${theme.text}`}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field resize-none"
                    placeholder="Tell us about your event..."
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary group mt-8 w-full disabled:opacity-60"
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <PaperAirplaneIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { MapPinIcon, EnvelopeIcon, PhoneIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function Footer() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email first');
    toast.success('Subscribed! Stay tuned for updates.');
    setEmail('');
  };

  const socials = [
    { icon: FaFacebook, href: 'https://facebook.com', hover: 'hover:text-blue-500', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', hover: 'hover:text-sky-400', label: 'Twitter' },
    { icon: FaLinkedin, href: 'https://linkedin.com', hover: 'hover:text-blue-600', label: 'LinkedIn' },
    { icon: FaInstagram, href: 'https://instagram.com', hover: 'hover:text-brand-400', label: 'Instagram' },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-slate-900 dark:bg-black">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-brand-500/20 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-brand-500/20 blur-[100px] animate-pulse-glow" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 shadow-lg shadow-brand-500/30">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-xl font-bold text-white">
                EMS
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Plan, organize and manage unforgettable events. From intimate gatherings to large-scale
              conferences — we make it effortless.
            </p>
            <div className="flex space-x-3">
              {socials.map(({ icon: Icon, href, hover, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ${hover}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">Reach Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3 transition-colors hover:text-slate-200">
                <MapPinIcon className="h-5 w-5 shrink-0 text-brand-400" />
                123 Event Street, City, Country
              </li>
              <li className="flex items-start gap-3 transition-colors hover:text-slate-200">
                <EnvelopeIcon className="h-5 w-5 shrink-0 text-brand-400" />
                info@ems.com
              </li>
              <li className="flex items-start gap-3 transition-colors hover:text-slate-200">
                <PhoneIcon className="h-5 w-5 shrink-0 text-brand-400" />
                +123 456 7890
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">Services</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {['Decoration', 'Lighting', 'Catering', 'Sound System', 'Event Planning'].map(service => (
                <li key={service}>
                  <Link to="/services" className="group flex items-center gap-2 transition-colors hover:text-brand-400">
                    <span className="h-1 w-1 rounded-full bg-brand-500 transition-transform group-hover:scale-150" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">Stay Updated</h3>
            <p className="mb-4 text-sm text-slate-400">
              Get the latest events and offers straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EMS. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/about" className="transition-colors hover:text-brand-400">About</Link>
            <Link to="/contact" className="transition-colors hover:text-brand-400">Contact</Link>
            <Link to="/calendar" className="transition-colors hover:text-brand-400">Calendar</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
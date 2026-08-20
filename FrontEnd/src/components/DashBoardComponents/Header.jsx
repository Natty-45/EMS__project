import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import NavLink from './NavLink';
import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser } = useSelector(state => state.user);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/events', label: 'Events' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/calendar', label: 'Calendar' },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-slate-200/60 dark:border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
              <CalendarDaysIcon className="h-5 w-5 text-white" />
            </span>
            <span className={`font-display text-xl font-bold tracking-tight ${theme.text}`}>
              EMS
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            {currentUser ? (
              <>
                <NotificationBell />
                <ProfileMenu />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 ${theme.textSecondary} hover:text-brand-500`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className={`rounded-xl p-2.5 transition-colors ${theme.card} ${theme.text}`}
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/90 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} label={item.label} onClick={closeMenu} />
              ))}
              <div className="mt-3 border-t border-slate-200/60 pt-4 dark:border-white/5">
                {currentUser ? (
                  <ProfileMenu />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold dark:border-white/15"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenu}
                      className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-brand-500/30"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import NavLink from './NavLink';
import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {currentUser} = useSelector(state => state.user);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`${theme.header} shadow-md fixed w-full z-50 ${isScrolled ? 'bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg' : `${theme.background}`}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className={`text-2xl font-bold ${theme.text}`}>
            Events
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md focus:outline-none"
          >
            {isMenuOpen ? (
              <XMarkIcon className={`h-6 w-6 ${theme.text}`} />
            ) : (
              <Bars3Icon className={`h-6 w-6 ${theme.text}`} />
            )}
          </button>

          {/* Theme toggle always visible */}

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6 font-semibold">
            <NavLink to="/events" label="Home" />
            <NavLink to="/services" label="Services" />
            <NavLink to="/about" label="About Us" />
            <NavLink to="/contact" label="Contact" />
            <NavLink to="/calendar" label="Calendar" />
            <ThemeToggle />
            {currentUser ? (
              <>
                <NotificationBell />
                <ProfileMenu />
              </>
            ) : (
              <Link
                to="/signup"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-opacity"
              >
                Sign Up
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <NavLink to="/events" label="Home" onClick={closeMenu} />
              <NavLink to="/services" label="Services" onClick={closeMenu} />
              <NavLink to="/about" label="About Us" onClick={closeMenu} />
              <NavLink to="/contact" label="Contact" onClick={closeMenu} />
              <NavLink to="/calendar" label="Calendar" onClick={closeMenu} />
              <div className="flex items-center justify-between">
                <ThemeToggle />
                { currentUser ? (
                  <ProfileMenu />
                ) : (
                  <Link
                    to="/signup"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-opacity"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
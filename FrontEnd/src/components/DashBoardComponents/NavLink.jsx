import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function NavLink({ to, label, onClick }) {
  const { theme } = useTheme();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative py-2 text-sm font-medium transition-colors duration-300 ${
        isActive ? 'text-brand-600 dark:text-brand-400' : theme.textSecondary
      } hover:text-brand-600 dark:hover:text-brand-400`}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}
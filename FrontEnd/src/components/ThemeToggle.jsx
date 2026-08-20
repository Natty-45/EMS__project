import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme.name === 'light';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      aria-label="Toggle theme"
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
        isLight
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
          : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
      }`}
    >
      <AnimatedIcon isLight={isLight} />
    </motion.button>
  );
}

function AnimatedIcon({ isLight }) {
  return (
    <motion.div
      key={isLight ? 'sun' : 'moon'}
      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'backOut' }}
    >
      {isLight ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </motion.div>
  );
}
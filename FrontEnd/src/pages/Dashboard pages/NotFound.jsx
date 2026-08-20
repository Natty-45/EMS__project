import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import GradientText from '../../components/ui/GradientText';

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.background}`}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] animate-float-slow" />

      <div className="relative z-10 px-4 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-[8rem] font-bold leading-none sm:text-[11rem]">
            <GradientText>404</GradientText>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className={`mt-4 font-display text-3xl font-bold ${theme.text}`}>Page Not Found</h1>
          <p className={`mx-auto mt-3 max-w-md text-lg ${theme.textSecondary}`}>
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>
          <Link to="/" className="btn-primary mt-10">
            Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
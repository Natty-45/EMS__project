import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from "../../contexts/ThemeContext";
import useResetPassword from '../../hooks/authHooks/useResetPassword';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const { theme } = useTheme();
  const { token } = useParams();
  const { formData, loading, handleChange, handleSubmit } = useResetPassword(token);

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.background}`}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] animate-float-slow" />

      <motion.div
        className="relative z-10 w-full max-w-md px-4 pt-24 pb-16"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className={`relative overflow-hidden rounded-[2rem] ${theme.card} border ${theme.border} p-8 shadow-2xl shadow-brand-500/10 backdrop-blur-xl sm:p-10`}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 opacity-10 blur-2xl" />

          <div className="relative mb-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-lg shadow-brand-500/30">
              <LockClosedIcon className="h-7 w-7 text-white" />
            </span>
            <h2 className={`mt-5 font-display text-2xl font-bold ${theme.text}`}>Reset Password</h2>
            <p className={`mt-1 text-sm ${theme.textSecondary}`}>Choose a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label htmlFor="password" className={`mb-2 block text-sm font-semibold ${theme.text}`}>New Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input-field pl-12"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className={`mb-2 block text-sm font-semibold ${theme.text}`}>Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input-field pl-12"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-primary group w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
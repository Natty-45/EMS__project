import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLogin from '../../hooks/authHooks/useLogin';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ArrowRightIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { theme } = useTheme();
  const { loading, error, login } = useLogin();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      toast.error('All fields are required');
      return;
    }

    await login(username, password);
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.background}`}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] animate-float-slow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

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
              <CalendarDaysIcon className="h-7 w-7 text-white" />
            </span>
            <h2 className={`mt-5 font-display text-2xl font-bold ${theme.text}`}>Welcome back</h2>
            <p className={`mt-1 text-sm ${theme.textSecondary}`}>Log in to manage your events</p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label className={`mb-2 block text-sm font-semibold ${theme.text}`} htmlFor="username">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${theme.text}`} htmlFor="password">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <motion.p
                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary group w-full"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative mt-6 text-center">
            <p className={`text-sm ${theme.textSecondary}`}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-brand-500 transition-colors hover:text-brand-600">
                Sign up
              </Link>
            </p>
            <Link
              to="/forgetPassword"
              className="mt-3 inline-block text-sm font-semibold text-slate-400 transition-colors hover:text-brand-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
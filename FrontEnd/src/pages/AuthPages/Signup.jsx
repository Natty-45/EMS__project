import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import useSignup from '../../hooks/authHooks/useSignup';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, UserIcon, LockClosedIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Signup() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { loading, error, signup } = useSignup();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  const fields = [
    { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: UserIcon, required: true },
    { id: 'username', label: 'Username', type: 'text', placeholder: 'johndoe', icon: UserIcon, required: true },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com', icon: EnvelopeIcon, required: true },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: LockClosedIcon, required: true },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', icon: LockClosedIcon, required: true },
  ];

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.background}`}>
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px] animate-float-slow" />
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
              <CalendarDaysIcon className="h-7 w-7 text-white" />
            </span>
            <h2 className={`mt-5 font-display text-2xl font-bold ${theme.text}`}>Create your account</h2>
            <p className={`mt-1 text-sm ${theme.textSecondary}`}>Join EMS and start planning</p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            {fields.map(({ id, label, type, placeholder, icon: Icon, required }) => (
              <div key={id}>
                <label className={`mb-2 block text-sm font-semibold ${theme.text}`} htmlFor={id}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id]}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder={placeholder}
                    required={required}
                  />
                </div>
              </div>
            ))}

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
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative mt-6 text-center">
            <p className={`text-sm ${theme.textSecondary}`}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-500 transition-colors hover:text-brand-600">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
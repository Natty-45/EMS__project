import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userStore/userSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CalendarDaysIcon,
  TicketIcon,
  UserCircleIcon,
  PlusCircleIcon,
  MegaphoneIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const ROLE_LABELS = { user: 'Member', Admin: 'Admin', superAdmin: 'Super Admin' };
const ROLE_BADGE = {
  user: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  Admin: 'bg-green-500/10 text-green-600 dark:text-green-400',
  superAdmin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export default function ProfileMenu() {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    setSidebarOpen(false);
    dispatch(logout());
    navigate('/');
  };

  const close = () => setSidebarOpen(false);

  const role = currentUser?.role || 'user';
  const isAdmin = role === 'Admin' || role === 'superAdmin';

  const menuGroups = [
    {
      label: 'General',
      items: [
        { to: '/', label: 'Dashboard', icon: HomeIcon },
        { to: '/createEvent', label: 'Create Event', icon: PlusCircleIcon },
        { to: '/my-events', label: 'My Events', icon: CalendarDaysIcon },
        { to: '/my-tickets', label: 'My Tickets', icon: TicketIcon },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            items: [
              { to: '/requested_events', label: 'Requested Events', icon: MegaphoneIcon },
            ],
          },
          {
            label: 'Reports',
            items: [
              { to: '/admin/export', label: 'Export Data', icon: DocumentArrowDownIcon },
              { to: '/admin/stats', label: 'Event Stats', icon: ChartBarIcon },
              { to: '/admin/tickets', label: 'Event Tickets', icon: TicketIcon },
            ],
          },
        ]
      : []),
    ...(role === 'superAdmin'
      ? [
          {
            label: 'Management',
            items: [{ to: '/admin/dashboard', label: 'User Management', icon: UsersIcon }],
          },
        ]
      : []),
    {
      label: 'Account',
      items: [
        { to: '/updateProfile', label: 'Edit Profile', icon: UserCircleIcon },
        { to: '/calendar', label: 'Event Calendar', icon: CalendarDaysIcon },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="group flex items-center gap-2.5 rounded-full border border-slate-200/60 bg-white/70 p-1.5 pr-3.5 transition-all duration-300 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 dark:border-white/10 dark:bg-white/5"
      >
        <img
          src={currentUser?.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="hidden max-w-[110px] truncate text-sm font-semibold xl:block">
          {currentUser?.fullName?.split(' ')[0]}
        </span>
        <Cog6ToothIcon className={`h-4 w-4 ${theme.textSecondary}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={close}
              />
              <motion.aside
                key="sidebar"
                className="fixed inset-y-0 right-0 z-[70] flex w-[320px] max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-900"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                {/* Header */}
                <div className="relative overflow-hidden border-b border-slate-200/60 p-6 dark:border-white/10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-15 blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={currentUser?.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'}
                          alt="Profile"
                          className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand-500/40"
                        />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                      </div>
                      <div>
                        <p className={`font-display text-sm font-bold ${theme.text}`}>
                          {currentUser?.fullName}
                        </p>
                        <p className={`text-xs ${theme.textSecondary}`}>@{currentUser?.username}</p>
                        <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${ROLE_BADGE[role] || ROLE_BADGE.user}`}>
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          {ROLE_LABELS[role] || 'Member'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={close}
                      aria-label="Close menu"
                      className={`rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 ${theme.text}`}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto p-4">
                  {menuGroups.map((group) => (
                    <div key={group.label} className="mb-5">
                      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.to + item.label}
                            to={item.to}
                            onClick={close}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${theme.textSecondary} hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400`}
                          >
                            <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-200/60 p-4 dark:border-white/10">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
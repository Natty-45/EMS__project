import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import Reveal from '../../components/ui/Reveal';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import GradientText from '../../components/ui/GradientText';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import { format } from 'date-fns';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  UsersIcon,
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  MegaphoneIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const ROLE_LABELS = { user: 'Member', Admin: 'Admin', superAdmin: 'Super Admin' };
const ROLE_BADGE = {
  user: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30',
  Admin: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  superAdmin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
};

const fetcher = async (url) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
};

export default function RoleDashboard() {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser?.role || 'user';

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <WelcomeHeader currentUser={currentUser} role={role} />
        {role === 'superAdmin' ? (
          <SuperAdminDashboard />
        ) : role === 'Admin' ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        )}
      </div>
    </div>
  );
}

function WelcomeHeader({ currentUser, role }) {
  const { theme } = useTheme();
  return (
    <Reveal>
      <div className={`relative overflow-hidden rounded-[2rem] ${theme.card} border ${theme.border} p-8 sm:p-10`}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            <img
              src={currentUser?.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'}
              alt={currentUser?.fullName}
              className="h-20 w-20 rounded-2xl border-4 border-brand-500/30 object-cover shadow-lg shadow-brand-500/20"
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-4 ring-white dark:ring-slate-900">
              <CheckCircleIcon className="h-4 w-4 text-white" />
            </span>
          </div>
          <div className="flex-1">
            <p className={`text-sm ${theme.textSecondary}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className={`mt-1 font-display text-2xl font-bold sm:text-3xl ${theme.text}`}>
              Welcome back, <GradientText>{currentUser?.fullName?.split(' ')[0]}</GradientText> 👋
            </h1>
            <span className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${ROLE_BADGE[role] || ROLE_BADGE.user}`}>
              <ShieldCheckIcon className="h-4 w-4" />
              {ROLE_LABELS[role] || 'Member'}
            </span>
          </div>
          <div className="hidden sm:block">
            <QuickAction currentUser={currentUser} role={role} compact />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function QuickAction({ currentUser, role, compact = false }) {
  const { theme } = useTheme();
  if (role === 'superAdmin') {
    return (
      <Link to="/admin/dashboard" className="btn-primary">
        <UsersIcon className="h-5 w-5" />
        User Management
      </Link>
    );
  }
  if (role === 'Admin') {
    return (
      <Link to="/requested_events" className="btn-primary">
        <MegaphoneIcon className="h-5 w-5" />
        Review Requests
      </Link>
    );
  }
  return (
    <Link to="/createEvent" className="btn-primary">
      <PlusCircleIcon className="h-5 w-5" />
      Create Event
    </Link>
  );
}

/* ===================== SUPER ADMIN ===================== */
function SuperAdminDashboard() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { events } = useGetAllEvents();

  useEffect(() => {
    fetcher('/api/user/all')
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Users', value: users.length, icon: <UsersIcon className="h-6 w-6 text-brand-500" /> },
    { label: 'Admins', value: users.filter(u => u.role !== 'user').length, icon: <ShieldCheckIcon className="h-6 w-6 text-green-500" /> },
    { label: 'Verified Users', value: users.filter(u => u.isVerified).length, icon: <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> },
    { label: 'Live Events', value: events.filter(e => e.eventStatus === 'Active').length, icon: <CalendarDaysIcon className="h-6 w-6 text-purple-500" /> },
  ];

  const actions = [
    { to: '/requested_events', label: 'Requested Events', desc: 'Approve or reject pending requests', icon: MegaphoneIcon },
    { to: '/createEvent', label: 'Create Event', desc: 'Publish a new event', icon: PlusCircleIcon },
    { to: '/admin/export', label: 'Export Data', desc: 'Download events as CSV', icon: DocumentArrowDownIcon },
    { to: '/admin/stats', label: 'Event Stats', desc: 'Revenue and ticket analytics', icon: ChartBarIcon },
    { to: '/admin/tickets', label: 'Event Tickets', desc: 'View all booked tickets', icon: TicketIcon },
    { to: '/admin/dashboard', label: 'User Management', desc: 'Manage roles and users', icon: UsersIcon },
  ];

  return (
    <div className="mt-8 space-y-10">
      <StatGrid stats={stats} />
      <QuickActionsGrid actions={actions} />
      <RecentUsers users={users} loading={loading} />
    </div>
  );
}

/* ===================== ADMIN ===================== */
function AdminDashboard() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { events } = useGetAllEvents();

  useEffect(() => {
    Promise.all([
      fetcher('/api/user/all').catch(() => []),
      fetcher('/api/event/requested_events').catch(() => []),
    ])
      .then(([u, p]) => {
        setUsers(u);
        setPending(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Live Events', value: events.filter(e => e.eventStatus === 'Active').length, icon: <CalendarDaysIcon className="h-6 w-6 text-brand-500" /> },
    { label: 'Pending Requests', value: pending.length, icon: <ClockIcon className="h-6 w-6 text-yellow-500" /> },
    { label: 'Verified Members', value: users.filter(u => u.isVerified && u.role === 'user').length, icon: <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> },
    { label: 'Total Members', value: users.length, icon: <UsersIcon className="h-6 w-6 text-purple-500" /> },
  ];

  const actions = [
    { to: '/requested_events', label: 'Requested Events', desc: 'Approve or reject pending requests', icon: MegaphoneIcon },
    { to: '/createEvent', label: 'Create Event', desc: 'Publish a new event', icon: PlusCircleIcon },
    { to: '/admin/export', label: 'Export Data', desc: 'Download events as CSV', icon: DocumentArrowDownIcon },
    { to: '/admin/stats', label: 'Event Stats', desc: 'Revenue and ticket analytics', icon: ChartBarIcon },
    { to: '/admin/tickets', label: 'Event Tickets', desc: 'View all booked tickets', icon: TicketIcon },
    { to: '/calendar', label: 'Event Calendar', desc: 'See the full schedule', icon: CalendarDaysIcon },
  ];

  return (
    <div className="mt-8 space-y-10">
      <StatGrid stats={stats} />
      <QuickActionsGrid actions={actions} />
      <PendingRequests pending={pending} loading={loading} />
    </div>
  );
}

/* ===================== USER ===================== */
function UserDashboard() {
  const { theme } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { events } = useGetAllEvents();
  const upcoming = events.filter(e => e.eventStatus === 'Active').slice(0, 3);

  useEffect(() => {
    Promise.all([
      fetcher('/api/user/tickets').catch(() => []),
      fetcher('/api/event/my-events').catch(() => []),
    ])
      .then(([t, e]) => {
        setTickets(t);
        setMyEvents(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'My Tickets', value: tickets.length, icon: <TicketIcon className="h-6 w-6 text-brand-500" /> },
    { label: 'My Events', value: myEvents.length, icon: <CalendarDaysIcon className="h-6 w-6 text-purple-500" /> },
    { label: 'Live Events', value: events.filter(e => e.eventStatus === 'Active').length, icon: <SparklesIcon className="h-6 w-6 text-yellow-500" /> },
  ];

  const actions = [
    { to: '/createEvent', label: 'Create Event', desc: 'Submit an event for approval', icon: PlusCircleIcon },
    { to: '/my-events', label: 'My Events', desc: 'Track your events & requests', icon: CalendarDaysIcon },
    { to: '/my-tickets', label: 'My Tickets', desc: 'View your booked tickets', icon: TicketIcon },
    { to: '/events', label: 'Browse Events', desc: 'Discover and book events', icon: MegaphoneIcon },
  ];

  return (
    <div className="mt-8 space-y-10">
      <StatGrid stats={stats} />
      <QuickActionsGrid actions={actions} />
      <UserRecentSection tickets={tickets} upcoming={upcoming} loading={loading} />
    </div>
  );
}

/* ===================== SHARED SECTIONS ===================== */

function StatGrid({ stats }) {
  const { theme } = useTheme();
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Reveal key={stat.label} delay={index * 0.08}>
          <div className={`group relative overflow-hidden rounded-3xl ${theme.card} border ${theme.border} p-6 card-hover`}>
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              {stat.icon}
            </span>
            <div className={`mt-4 font-display text-3xl font-bold ${theme.text}`}>
              <AnimatedCounter value={stat.value} />
            </div>
            <p className={`mt-1 text-sm ${theme.textSecondary}`}>{stat.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function QuickActionsGrid({ actions }) {
  const { theme } = useTheme();
  return (
    <div>
      <Reveal>
        <h2 className={`mb-6 font-display text-xl font-bold ${theme.text}`}>Quick Actions</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Reveal key={action.label} delay={index * 0.06}>
            <Link
              to={action.to}
              className={`group flex items-center gap-4 rounded-2xl ${theme.card} border ${theme.border} p-5 card-hover`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-400/15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <action.icon className="h-6 w-6 text-brand-500" />
              </span>
              <div className="flex-1">
                <h3 className={`font-display text-sm font-bold ${theme.text}`}>{action.label}</h3>
                <p className={`mt-0.5 text-xs ${theme.textSecondary}`}>{action.desc}</p>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function RecentUsers({ users, loading }) {
  const { theme } = useTheme();
  const recent = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`font-display text-xl font-bold ${theme.text}`}>Recent Users</h2>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600">
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className={`overflow-hidden rounded-3xl ${theme.card} border ${theme.border}`}>
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-400">Loading users...</p>
          ) : recent.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No users yet</p>
          ) : (
            <div className="divide-y dark:divide-white/5">
              {recent.map((user) => (
                <div key={user._id} className="flex items-center gap-4 p-4 transition-colors hover:bg-brand-500/5">
                  <img src={user.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${theme.text}`}>{user.fullName}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{user.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${ROLE_BADGE[user.role] || ROLE_BADGE.user}`}>
                    {ROLE_LABELS[user.role] || 'Member'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function PendingRequests({ pending, loading }) {
  const { theme } = useTheme();
  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`font-display text-xl font-bold ${theme.text}`}>Awaiting Your Approval</h2>
          <Link to="/requested_events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600">
            Review all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-sm text-slate-400">Loading requests...</p>
        ) : pending.length === 0 ? (
          <p className={`text-sm ${theme.textSecondary}`}>No pending requests — you're all caught up!</p>
        ) : (
          pending.slice(0, 4).map((req, index) => (
            <Reveal key={req._id} delay={index * 0.08}>
              <Link to={`/requested-event/approve/${req._id}`} className={`group flex items-center gap-4 rounded-2xl ${theme.card} border ${theme.border} p-5 card-hover`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15">
                  <ClockIcon className="h-6 w-6 text-yellow-500" />
                </span>
                <div className="flex-1">
                  <h3 className={`font-display text-sm font-bold ${theme.text}`}>{req.title}</h3>
                  <p className={`mt-0.5 flex items-center gap-1 text-xs ${theme.textSecondary}`}>
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {req.location} · {format(new Date(req.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
              </Link>
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}

function UserRecentSection({ tickets, upcoming, loading }) {
  const { theme } = useTheme();
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <Reveal>
          <div className="mb-6 flex items-center justify-between">
            <h2 className={`font-display text-xl font-bold ${theme.text}`}>My Tickets</h2>
            <Link to="/my-tickets" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600">
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className={`overflow-hidden rounded-3xl ${theme.card} border ${theme.border}`}>
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <TicketIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className={`mt-3 text-sm font-semibold ${theme.text}`}>No tickets yet</p>
                <Link to="/events" className="mt-2 inline-block text-sm font-semibold text-brand-500 hover:text-brand-600">
                  Browse events →
                </Link>
              </div>
            ) : (
              <div className="divide-y dark:divide-white/5">
                {tickets.slice(0, 4).map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className={`text-sm font-semibold ${theme.text}`}>
                        {ticket.eventId?.title || 'Event'}
                      </p>
                      <p className={`text-xs ${theme.textSecondary}`}>
                        {ticket.ticketType} · x{ticket.numberOfTickets} ·{' '}
                        {format(new Date(ticket.bookingDate), 'MMM d')}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500">
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <div>
        <Reveal delay={0.05}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className={`font-display text-xl font-bold ${theme.text}`}>Trending Now</h2>
            <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600">
              Explore <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="space-y-4">
          {upcoming.map((event, index) => (
            <Reveal key={event._id} delay={index * 0.08}>
              <Link to={`/events/${event._id}`} className={`group flex items-center gap-4 rounded-2xl ${theme.card} border ${theme.border} p-4 card-hover`}>
                <img
                  src={event.image?.[0] ? (event.image[0].startsWith('http') ? event.image[0] : `/uploads/${event.image[0]}`) : '/placeholder.jpg'}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className={`font-display text-sm font-bold ${theme.text}`}>{event.title}</h3>
                  <p className={`mt-0.5 flex items-center gap-1 text-xs ${theme.textSecondary}`}>
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                    {format(new Date(event.date), 'MMM d, yyyy')} · {event.location}
                  </p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
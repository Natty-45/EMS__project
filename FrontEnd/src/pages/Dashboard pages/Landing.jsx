import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import EventCard from '../../components/EventComponents/EventCard';
import { motion } from 'framer-motion';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import Marquee from '../../components/ui/Marquee';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import GradientText from '../../components/ui/GradientText';
import {
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  RocketLaunchIcon,
  UsersIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function Landing() {
  const { theme, isLightMode } = useTheme();
  const { events, loading } = useGetAllEvents();
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className={`${theme.background} overflow-hidden`}>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center pt-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-500/30 blur-[120px] animate-float-slow" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-brand-500/25 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-400/20 blur-[100px] animate-pulse-glow" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                <SparklesIcon className="h-4 w-4" />
                The smarter way to plan events
              </span>
            </motion.div>

            <motion.h1
              className={`mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl ${theme.text}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Create Memorable
              <br />
              <GradientText>Company Events</GradientText>
            </motion.h1>

            <motion.p
              className={`mt-6 max-w-xl text-lg leading-relaxed ${theme.textSecondary}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Plan, organize, and manage your corporate events with ease. From team building to
              conferences — everything you need, all in one place.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <Link to="/signup" className="btn-primary group">
                Get Started
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/events" className="btn-ghost group">
                <PlayIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Explore Events
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { value: 500, suffix: '+', label: 'Events Hosted' },
                { value: 50, suffix: '+', label: 'Corporate Clients' },
                { value: 98, suffix: '%', label: 'Satisfaction' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className={`font-display text-3xl font-bold ${theme.text}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className={`mt-1 text-sm ${theme.textSecondary}`}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating hero visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-500 via-brand-400 to-brand-600 opacity-20 blur-2xl" />
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                      Today
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <CalendarDaysIcon className="h-5 w-5 text-white" />
                    </span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { time: '10:00', title: 'Leadership Summit', tag: 'Conference' },
                      { time: '14:30', title: 'Team Building Retreat', tag: 'Team Building' },
                      { time: '18:00', title: 'Annual Gala Dinner', tag: 'Celebration' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.2 }}
                        whileHover={{ x: 6 }}
                      >
                        <span className="font-display text-sm font-bold text-white">{item.time}</span>
                        <div className="h-8 w-0.5 rounded bg-gradient-to-b from-brand-400 to-brand-600" />
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-white/60">{item.tag}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-4 text-center shadow-xl shadow-brand-500/30">
                    <p className="text-sm font-semibold text-white">Next event in</p>
                    <p className="font-display text-2xl font-bold text-white">02 : 14 : 36</p>
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -left-16 top-16 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 dark:shadow-black/40 animate-float"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                  <UsersIcon className="h-5 w-5 text-green-500" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white">250+ Attendees</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Registered today</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-10 bottom-24 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 dark:shadow-black/40 animate-float-slow"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
                  <ShieldCheckIcon className="h-5 w-5 text-brand-500" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Secure Booking</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">End-to-end encrypted</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-slate-400 p-1.5 dark:border-slate-600">
            <div className="h-2 w-1 rounded-full bg-brand-500" />
          </div>
        </motion.div>
      </section>

      {/* ===== MARQUEE STRIP ===== */}
      <Marquee
        items={['Conferences', 'Weddings', 'Corporate Retreats', 'Product Launches', 'Workshops', 'Galas', 'Team Building']}
      />

      {/* ===== UPCOMING EVENTS ===== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="What's coming up"
            title={<>Upcoming <span className="text-gradient">Events</span></>}
            subtitle="Don't miss out on these exciting events curated just for you."
          />

          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 rounded-full bg-brand-500/10 px-6 py-3 text-brand-600 dark:text-brand-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
                Loading events...
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <Reveal key={event._id || event.id} delay={index * 0.15}>
                <div className="group h-full card-hover">
                  <EventCard event={event} />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-14 text-center">
            <Link to="/events" className="btn-primary group">
              View All Events
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={`relative py-24 ${isLightMode ? 'bg-slate-100/70' : 'bg-white/[0.03]'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Why choose us"
            title={<>Everything you need to <span className="text-gradient">succeed</span></>}
            subtitle="Powerful tools designed to make event management effortless from start to finish."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <div className={`group relative h-full overflow-hidden rounded-3xl p-6 ${theme.card} border ${theme.border} card-hover`}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30" />
                  <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.iconBg} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}>
                    {feature.icon}
                  </span>
                  <h3 className={`relative mt-5 font-display text-lg font-bold ${theme.text}`}>
                    {feature.title}
                  </h3>
                  <p className={`relative mt-2 text-sm leading-relaxed ${theme.textSecondary}`}>
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-10 sm:p-16 shadow-2xl shadow-brand-500/30">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float-slow" />
              <div className="relative grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                    Ready to host your next big event?
                  </h2>
                  <p className="mt-4 max-w-lg text-lg text-white/80">
                    Join hundreds of companies creating unforgettable experiences with EMS.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 lg:justify-end">
                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand-600 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <RocketLaunchIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
                    Create an Account
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    Talk to Sales
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <RocketLaunchIcon className="h-7 w-7 text-white" />,
    iconBg: 'from-brand-500 to-brand-400',
    title: 'Professional Planning',
    description: 'Expert event planners to handle every detail of your corporate events.',
  },
  {
    icon: <UsersIcon className="h-7 w-7 text-white" />,
    iconBg: 'from-brand-600 to-brand-500',
    title: 'Team Building',
    description: 'Engaging activities designed to strengthen team bonds and company culture.',
  },
  {
    icon: <ChartBarIcon className="h-7 w-7 text-white" />,
    iconBg: 'from-brand-500 to-brand-300',
    title: 'Live Analytics',
    description: 'Track attendance, engagement and feedback in real time with rich dashboards.',
  },
  {
    icon: <ShieldCheckIcon className="h-7 w-7 text-white" />,
    iconBg: 'from-brand-700 to-brand-500',
    title: 'Full Management',
    description: 'End-to-end event management from concept to execution with secure ticketing.',
  },
];
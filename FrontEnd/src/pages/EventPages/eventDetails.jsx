import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import useEventDetails from '../../hooks/eventHooks/useEventDetails';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const EventDetails = () => {
  const { theme } = useTheme();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const isStaff = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'superAdmin');

  const { event, loading, error } = useEventDetails(eventId);

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.background}`}>
        <div className="flex items-center gap-3 rounded-full bg-brand-500/10 px-6 py-3 text-brand-600 dark:text-brand-400">
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
          Loading event...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.background}`}>
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.background}`}>
        <p className="text-lg font-semibold">Event not found</p>
      </div>
    );
  }

  const isRequestedEvent =
    event.isRequestedEvent || event.requestEventStatus !== undefined || event.requester !== undefined;

  const canBook =
    !isRequestedEvent && (event.eventStatus === 'Active' || event.eventStatus === 'Pending');

  const getImageUrl = (img) => {
    if (!img) return '/placeholder.jpg';
    return img.startsWith('http') ? img : `/uploads/${img}`;
  };

  const images = event.image && event.image.length > 0 ? event.image : [];
  const mainImage = images.length > 0 ? getImageUrl(images[selectedImage]) : '/placeholder.jpg';

  const handleNavigateToBooking = () => {
    navigate(`/booking/${eventId}`);
  };

  const details = [
    { icon: CalendarIcon, label: 'Date', text: format(new Date(event.date), 'MMMM d, yyyy') },
    { icon: ClockIcon, label: 'Time', text: event.StartTime },
    { icon: MapPinIcon, label: 'Location', text: event.location },
    { icon: UserIcon, label: 'Host', text: event.host },
    { icon: TagIcon, label: 'Category', text: event.eventCategory },
  ];

  return (
    <div className={`relative min-h-screen ${theme.background} pt-32 pb-20`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-80 w-80 rounded-full bg-brand-500/20 blur-[130px] animate-pulse-glow" />
        <div className="h-72 w-72 rounded-full bg-brand-500/15 blur-[120px] animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/events"
          className={`mb-8 inline-flex items-center gap-2 text-sm font-semibold ${theme.textSecondary} transition-colors hover:text-brand-500`}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to all events
        </Link>

        <motion.div
          className="grid gap-10 lg:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Image gallery */}
          <div>
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/20"
              whileHover={{ scale: 1.01 }}
            >
              <img
                src={mainImage}
                alt={event.title || 'Event image'}
                className="h-72 w-full object-cover sm:h-96"
                key={selectedImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {event.eventStatus && (
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-slate-900 backdrop-blur">
                  {event.eventStatus}
                </span>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-brand-500 shadow-lg shadow-brand-500/30 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TagIcon className="h-4 w-4" />
              {event.eventCategory}
            </motion.span>

            <motion.h1
              className={`mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl ${theme.text}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {event.title || 'Untitled Event'}
            </motion.h1>

            <motion.div
              className={`mt-8 space-y-4 rounded-3xl ${theme.card} border ${theme.border} p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {details.map(({ icon: Icon, label, text }, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.08 }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-400/15">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className={`font-medium ${theme.text}`}>{text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              className={`mt-6 text-base leading-relaxed sm:text-lg ${theme.textSecondary}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {event.description}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {canBook && !isStaff ? (
                <motion.button
                  onClick={handleNavigateToBooking}
                  className="btn-primary group flex-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <TicketIcon className="h-5 w-5" />
                  Book Now
                </motion.button>
              ) : (
                <button
                  disabled
                  className="flex-1 cursor-not-allowed rounded-xl bg-slate-400/60 px-6 py-3.5 font-semibold text-white"
                  title={isStaff ? "Admins manage events and cannot book tickets" : "Booking unavailable for requested or inactive events"}
                >
                  {isStaff ? 'Admins Cannot Book' : 'Booking Unavailable'}
                </button>
              )}
              <div className="rounded-2xl border border-dashed border-brand-500/40 px-6 py-3 text-center">
                <p className="text-xs text-slate-400">Hosted by</p>
                <p className={`font-display text-lg font-bold ${theme.text}`}>{event.host}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetails;
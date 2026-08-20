import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import EventCard from '../../components/EventComponents/EventCard';
import { motion } from 'framer-motion';
import useGetAllEvents from '../../hooks/eventHooks/useGetAllEvents';

export default function Landing() {
  const { theme, isLightMode } = useTheme();
  const { events, loading } = useGetAllEvents();
  const upcomingEvents = events.slice(0, 3);

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt="Events background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Create Memorable Company Events
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Plan, organize, and manage your corporate events with ease. From team building to conferences, we've got you covered.
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-semibold inline-block transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-6 py-3 rounded-md text-lg font-semibold inline-block hover:bg-white hover:text-gray-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Upcoming Events Section */}
      <section className={`${theme.card} py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} text-center mb-4`}>
            Upcoming Events
          </h2>
          <p className={`${theme.textSecondary} text-center mb-12`}>
            Don't miss out on these exciting upcoming events
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map(event => (
              <motion.div
                key={event.id}
                className="flex flex-col h-full"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: event.id * 0.2 }}
                whileHover={{ scale: 1.05, boxShadow: isLightMode ? '0 0 15px rgba(128, 128, 128, 0.5)' : '0 0 15px rgba(255, 255, 255, 0.5)' }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/events"
              className={` ${theme.text} bg-blue-500 px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90 transition-opacity inline-block`}
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      {isLightMode && (
        <div className="border-t border-gray-300 "></div>
      )}

      {/* Features Section */}
      <section className={`${theme.background} py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} text-center mb-12`}>
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`${theme.card} rounded-lg p-6 text-center`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, boxShadow: isLightMode ? '0 0 15px rgba(128, 128, 128, 0.5)' : '0 0 15px rgba(255, 255, 255, 0.5)' }}
              >
                <div className={`${theme.text} text-4xl mb-4`}>{feature.icon}</div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>
                  {feature.title}
                </h3>
                <p className={theme.textSecondary}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "🎯",
    title: "Professional Planning",
    description: "Expert event planners to handle every detail of your corporate events."
  },
  {
    icon: "🤝",
    title: "Team Building",
    description: "Engaging activities designed to strengthen team bonds and company culture."
  },
  {
    icon: "📊",
    title: "Full Management",
    description: "End-to-end event management from concept to execution."
  }
];
import { useTheme } from '../../contexts/ThemeContext';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import GradientText from '../../components/ui/GradientText';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { motion } from 'framer-motion';
import { HeartIcon, FlagIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function About() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeading
          badge="Who we are"
          title={<>About <GradientText>Us</GradientText></>}
          subtitle="A dedicated team of event planning professionals committed to creating memorable corporate experiences."
        />

        {/* Mission cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={index} delay={index * 0.12}>
              <motion.div
                className={`group relative h-full overflow-hidden rounded-3xl ${theme.card} border ${theme.border} p-8 card-hover`}
                whileHover={{ y: -8 }}
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${value.bg} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  {value.icon}
                </span>
                <h3 className={`mt-5 font-display text-lg font-bold ${theme.text}`}>{value.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${theme.textSecondary}`}>{value.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Stats */}
        <Reveal delay={0.1}>
          <div className={`mt-16 overflow-hidden rounded-[2.5rem] ${theme.card} border ${theme.border} p-10 sm:p-14`}>
            <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <div className={`font-display text-5xl font-bold ${theme.text}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className={`mt-2 text-sm ${theme.textSecondary}`}>{stat.label}</div>
                  <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Team */}
        <div className="mt-20">
          <Reveal>
            <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">
              Meet the <span className="text-gradient">Team</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {developers.map((developer, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <motion.div
                  className={`group overflow-hidden rounded-3xl ${theme.card} border ${theme.border} text-center card-hover`}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative mx-auto mt-8 h-28 w-28">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="relative h-28 w-28 rounded-full object-cover border-4 border-white dark:border-slate-800"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className={`font-display text-lg font-bold ${theme.text}`}>{developer.name}</h3>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-wider text-brand-500`}>
                      {developer.role}
                    </p>
                    <p className={`mt-3 text-sm leading-relaxed ${theme.textSecondary}`}>
                      {developer.description}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const values = [
  {
    icon: <HeartIcon className="h-7 w-7 text-white" />,
    bg: 'from-brand-600 to-brand-500',
    title: 'Passion',
    description: 'We genuinely care about making every event special and every guest delighted.',
  },
  {
    icon: <FlagIcon className="h-7 w-7 text-white" />,
    bg: 'from-brand-500 to-brand-400',
    title: 'Precision',
    description: 'Every detail is planned and executed with military-grade precision.',
  },
  {
    icon: <SparklesIcon className="h-7 w-7 text-white" />,
    bg: 'from-brand-700 to-brand-500',
    title: 'Creativity',
    description: 'Bold ideas and fresh concepts that make your event unforgettable.',
  },
];

const stats = [
  { value: 500, suffix: '+', label: 'Events Organized' },
  { value: 50, suffix: '+', label: 'Corporate Clients' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
];

const developers = [
  {
    image: "https://i.pravatar.cc/150?img=68",
    name: "John Doe",
    role: "Lead Developer",
    description: "10 years of experience in full-stack development.",
  },
  {
    image: "https://i.pravatar.cc/150?img=47",
    name: "Jane Smith",
    role: "Frontend Developer",
    description: "Specializes in React and modern web technologies.",
  },
  {
    image: "https://i.pravatar.cc/150?img=13",
    name: "Mike Johnson",
    role: "Backend Developer",
    description: "Expert in Node.js and database management.",
  },
  {
    image: "https://i.pravatar.cc/150?img=32",
    name: "Emily Davis",
    role: "UI/UX Designer",
    description: "Creates intuitive and beautiful user interfaces.",
  },
];
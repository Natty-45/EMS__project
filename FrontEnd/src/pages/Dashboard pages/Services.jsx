import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import GradientText from '../../components/ui/GradientText';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Services() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-brand-500/20 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeading
          badge="What we offer"
          title={<>Our <GradientText>Services</GradientText></>}
          subtitle="Full-service event planning and management, tailored to make every moment count."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={index} delay={(index % 3) * 0.12}>
              <motion.div
                className={`group relative h-full overflow-hidden rounded-3xl ${theme.card} border ${theme.border} p-8 card-hover`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25" />

                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-400/15 text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {service.icon}
                </span>
                <h3 className={`relative mt-6 font-display text-xl font-bold ${theme.text}`}>
                  {service.title}
                </h3>
                <p className={`relative mt-3 text-sm leading-relaxed ${theme.textSecondary}`}>
                  {service.description}
                </p>
                <ul className="relative mt-5 space-y-2">
                  {service.points.map((point, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${theme.textSecondary}`}>
                      <CheckCircleIcon className="h-4 w-4 shrink-0 text-brand-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`relative mt-6 inline-flex items-center gap-2 text-sm font-semibold ${theme.text} transition-colors group-hover:text-brand-500`}
                >
                  Request this service
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-10 text-center shadow-2xl shadow-brand-500/30 sm:p-14">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Not sure which service fits your needs?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Book a free consultation and our experts will design the perfect event plan for you.
            </p>
            <Link
              to="/contact"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand-600 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get a Free Consultation
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const services = [
  {
    icon: "🎪",
    title: "Corporate Events",
    description: "Full-service corporate event planning and management.",
    points: ["Venue selection", "Vendor management", "On-site coordination"],
  },
  {
    icon: "🤝",
    title: "Team Building",
    description: "Custom team building activities and workshops.",
    points: ["Icebreaker games", "Outdoor retreats", "Workshop facilitation"],
  },
  {
    icon: "🎓",
    title: "Training Sessions",
    description: "Professional development and training event organization.",
    points: ["Speaker booking", "Material design", "Certification support"],
  },
  {
    icon: "🎯",
    title: "Strategic Planning",
    description: "Strategic planning sessions and corporate retreats.",
    points: ["Agenda curation", "Retreat logistics", "Follow-up reporting"],
  },
  {
    icon: "🎉",
    title: "Company Celebrations",
    description: "Anniversary celebrations and milestone events.",
    points: ["Theme design", "Entertainment", "Catering & decor"],
  },
  {
    icon: "🤔",
    title: "Consulting",
    description: "Event planning consultation and advisory services.",
    points: ["Budget planning", "Risk assessment", "Timeline strategy"],
  },
];
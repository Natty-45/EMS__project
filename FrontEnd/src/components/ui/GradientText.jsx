import { motion } from 'framer-motion';

export default function GradientText({ children, className = '' }) {
  return (
    <motion.span
      className={`text-gradient ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.span>
  );
}
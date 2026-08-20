import Reveal from './Reveal';
import { useTheme } from '../../contexts/ThemeContext';

export default function SectionHeading({ badge, title, subtitle, center = true }) {
  const { theme } = useTheme();
  const align = center ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${align} mb-14`}>
      {badge && (
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            {badge}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <h2 className={`mt-4 text-3xl md:text-5xl font-bold tracking-tight ${theme.text}`}>
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className={`mt-4 max-w-2xl text-lg ${theme.textSecondary}`}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
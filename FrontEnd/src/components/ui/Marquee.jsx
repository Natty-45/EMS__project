import { useTheme } from '../../contexts/ThemeContext';

export default function Marquee({ items, className = '' }) {
  const { theme } = useTheme();
  const row = [...items, ...items];

  return (
    <div className={`relative overflow-hidden py-6 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950" />
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={i}
            className={`flex items-center gap-3 text-xl font-semibold ${theme.textSecondary}`}
          >
            <span className="text-brand-500">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
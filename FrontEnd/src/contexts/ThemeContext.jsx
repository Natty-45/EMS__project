import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  light: {
    name: 'light',
    mode: 'light',
    background: 'bg-slate-50',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    card: 'bg-white',
    header: 'bg-white/80',
    border: 'border-slate-200',
    primary: 'bg-brand-500',
    gradient: 'from-brand-500 to-brand-700',
  },
  dark: {
    name: 'dark',
    mode: 'dark',
    background: 'bg-slate-950',
    text: 'text-white',
    textSecondary: 'text-slate-400',
    card: 'bg-slate-900',
    header: 'bg-slate-950/80',
    border: 'border-slate-800',
    primary: 'bg-brand-500',
    gradient: 'from-brand-400 to-brand-600',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.light);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const next = prevTheme.name === 'light' ? themes.dark : themes.light;
      document.documentElement.classList.toggle('dark', next.name === 'dark');
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.name === 'dark');
  }, []);

  const isLightMode = theme.name === 'light';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
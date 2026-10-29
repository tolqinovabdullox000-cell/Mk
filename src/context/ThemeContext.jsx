
import { useEffect, useState } from 'react';
import { get, set } from '../lib/storage';
import { ThemeContext } from './ThemeContextValue';

function getInitialTheme() {
  const saved = get('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  // Birinchi kirishda telefon/kompyuter sozlamasiga qaraymiz
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    set('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

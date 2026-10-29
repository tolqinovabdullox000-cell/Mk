import { useContext } from 'react';
import { ThemeContext } from './ThemeContextValue';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme faqat ThemeProvider ichida ishlatiladi');
  return context;
}

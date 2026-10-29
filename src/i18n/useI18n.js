import { useContext } from 'react';
import { I18nContext } from './I18nContextValue';

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n faqat I18nProvider ichida ishlatiladi');
  return context;
}

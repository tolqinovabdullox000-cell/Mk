import { useEffect, useMemo, useState } from 'react';
import { get, set } from '../lib/storage';
import uz from './uz';
import uzCyrl from './uz-Cyrl';
import ru from './ru';
import { I18nContext } from './I18nContextValue';
const LOCALES = { uz, 'uz-Cyrl': uzCyrl, ru };
const LANGUAGE_CODES = { uz: 'uz', 'uz-Cyrl': 'uz-Cyrl', ru: 'ru' };

function getValue(source, key) {
  return key.split('.').reduce((value, part) => value?.[part], source);
}

function interpolate(value, params) {
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? `{${name}}`));
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = get('language', 'uz');
    return Object.hasOwn(LOCALES, saved) ? saved : 'uz';
  });

  const setLang = (next) => {
    if (!Object.hasOwn(LOCALES, next)) throw new Error(`Unsupported language: ${next}`);
    setLangState(next);
    set('language', next);
  };

  const value = useMemo(() => {
    const t = (key, params = {}) => {
      const selected = getValue(LOCALES[lang], key);
      const fallback = getValue(uz, key);
      let result = typeof selected === 'string' ? selected : fallback;
      if (typeof result !== 'string') {
        if (import.meta.env.DEV) console.warn(`Missing translation: ${key}`);
        result = '';
      }
      return interpolate(result, params);
    };
    const tp = (key, count) => {
      const rule = new Intl.PluralRules(lang === 'ru' ? 'ru' : 'uz').select(count);
      const selected = getValue(LOCALES[lang], key);
      const fallback = getValue(uz, key);
      const valueForCount = selected?.[rule] ?? selected?.other ?? fallback?.[rule] ?? fallback?.other;
      if (typeof valueForCount !== 'string') return t(key, { n: count });
      return interpolate(valueForCount, { n: count });
    };
    return { t, tp, lang, setLang };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_CODES[lang];
    document.title = value.t('app.title');
  }, [lang, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

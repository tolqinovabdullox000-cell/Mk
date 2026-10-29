import { useI18n } from '../i18n/useI18n';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t('language.label')}</span>
      <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={t('language.label')}>
        <option value="uz">{t('language.uz')}</option>
        <option value="uz-Cyrl">{t('language.cyr')}</option>
        <option value="ru">{t('language.ru')}</option>
      </select>
    </label>
  );
}

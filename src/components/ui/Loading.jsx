import { useI18n } from '../../i18n/useI18n';

export default function Loading() {
  const { t } = useI18n();
  return <p className="muted" role="status">{t('common.loading')}</p>;
}

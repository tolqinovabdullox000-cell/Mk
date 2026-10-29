import { useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { updatePassword } from '../lib/api/client';

export default function Account() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    if (password.length < 8) {
      setError('auth.passwordShort');
      return;
    }
    if (password !== confirmation) {
      setError('auth.passwordMismatch');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setPassword('');
      setConfirmation('');
    } catch {
      setError('auth.passwordUpdateFailed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div><h1>{t('navigation.account')}</h1></div>
      </div>
      <form className="card account-form" onSubmit={handleSubmit}>
        <label htmlFor="new-password">{t('auth.newPassword')}</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <label htmlFor="confirm-password">{t('auth.confirmPassword')}</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
        />
        {error && <div className="error" role="alert">{t(error)}</div>}
        {success && <p role="status">{t('auth.passwordChanged')}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('auth.changePassword')}
        </button>
      </form>
    </section>
  );
}

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { user, login, authError } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (!res.ok) setError(res.error);
    } catch (loginError) {
      setError('auth.invalidCredentials');
    }
  };

  return (
    <div className="login-page">
      <div className="login-language"><LanguageSwitcher /></div>
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>📚 UstozPanel</h1>
        <p className="muted">{t('auth.loginTitle')}</p>

        <label htmlFor="email">{t('auth.email')}</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />

        <label htmlFor="password">{t('auth.password')}</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {(error || authError) && <div className="error" role="alert">{t(error || authError)}</div>}

        <button className="btn btn-primary" type="submit">{t('auth.login')}</button>
      </form>
    </div>
  );
}

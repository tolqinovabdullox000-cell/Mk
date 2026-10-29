import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import { useI18n } from '../i18n/useI18n';
import LanguageSwitcher from './LanguageSwitcher';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onMenuClick} aria-label={t('navigation.menu')}>
        ☰
      </button>
      <div className="navbar-spacer" />
      <LanguageSwitcher />
      <button className="icon-btn" onClick={toggleTheme} aria-label={t('navigation.theme')}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <span className="navbar-user">{user?.name}</span>
      <button className="btn btn-outline" onClick={handleLogout}>
        {t('navigation.logout')}
      </button>
    </header>
  );
}

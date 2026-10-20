import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onMenuClick} aria-label="Menyu">
        ☰
      </button>
      <div className="navbar-spacer" />
      <button className="icon-btn" onClick={toggleTheme} aria-label="Rejimni almashtirish">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <span className="navbar-user">{user?.name}</span>
      <button className="btn btn-outline" onClick={logout}>
        Chiqish
      </button>
    </header>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useI18n } from '../i18n/useI18n';

const MENUS = {
  admin: [
    { to: '/admin', key: 'navigation.home', icon: '🏠', end: true },
    { to: '/admin/users', key: 'navigation.users', icon: '👥' },
    { to: '/admin/schedule', key: 'navigation.schedule', icon: '🗓️' },
  ],
  teacher: [
    { to: '/teacher', key: 'navigation.home', icon: '🏠', end: true },
    { to: '/teacher/schedule', key: 'navigation.schedule', icon: '🗓️' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const { t } = useI18n();
  const items = MENUS[role] ?? [];

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">📚 UstozPanel</div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              <span>{item.icon}</span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}

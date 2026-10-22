import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Har rol uchun menyu. Yangi sahifa qo'shilsa, shu yerga bitta qator qo'shamiz.
const MENUS = {
  admin: [
    { to: '/admin', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/admin/users', label: 'Foydalanuvchilar', icon: '👥' },
    { to: '/admin/schedule', label: 'Sinflar va jadval', icon: '🗓️' },
  ],
  teacher: [
    { to: '/teacher', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/teacher/schedule', label: 'Dars jadvali', icon: '🗓️' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const items = MENUS[role] ?? [];

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login', { replace: true });
  };

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
              {item.label}
            </NavLink>
          ))}
          {role === 'admin' && (
            <button className="nav-link sidebar-logout" type="button" onClick={handleLogout}>
              <span aria-hidden="true">↪</span>
              Chiqish
            </button>
          )}
        </nav>
      </aside>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}

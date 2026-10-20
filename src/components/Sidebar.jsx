import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Har rol uchun menyu. Yangi sahifa qo'shilsa, shu yerga bitta qator qo'shamiz.
const MENUS = {
  admin: [
    { to: '/admin', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/admin/lessons', label: 'Dars biriktirish', icon: '🎓' },
    { to: '/admin/classes', label: 'Sinflar', icon: '🏫' },
    { to: '/admin/users', label: 'Foydalanuvchilar', icon: '👥' },
  ],
  teacher: [
    { to: '/teacher', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/teacher/schedule', label: 'Dars jadvali', icon: '🗓️' },
    { to: '/teacher/attendance', label: 'Davomat', icon: '✅' },
    { to: '/teacher/homework', label: 'Uyga vazifa', icon: '📝' },
    { to: '/teacher/lesson-plan', label: 'Dars rejasi', icon: '📋' },
    { to: '/teacher/materials', label: 'Materiallar', icon: '📎' },
    { to: '/teacher/notes', label: 'Izohlar', icon: '🗒️' },
    { to: '/teacher/reports', label: 'Hisobotlar', icon: '📊' },
    { to: '/teacher/chat', label: 'Chat', icon: '💬' },
  ],
  student: [
    { to: '/student', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/student/schedule', label: 'Dars jadvali', icon: '🗓️' },
    { to: '/student/homework', label: 'Uyga vazifa', icon: '📝' },
  ],
  parent: [
    { to: '/parent', label: 'Bosh sahifa', icon: '🏠', end: true },
    { to: '/parent/attendance', label: 'Davomat', icon: '✅' },
    { to: '/parent/homework', label: 'Uyga vazifa', icon: '📝' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
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
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}

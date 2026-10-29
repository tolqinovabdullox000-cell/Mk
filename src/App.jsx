import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSchedule from './pages/teacher/Schedule';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSchedule from './pages/admin/Schedule';
import Loading from './components/ui/Loading';
import { useI18n } from './i18n/useI18n';
import Account from './pages/Account';

// Navbar + Sidebar + sahifa mazmuni (<Outlet />)
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authError } = useAuth();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="content">
          {authError && <div className="error notice" role="alert">{t(authError)}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Faqat o'z roli kirishi mumkin. Boshqa rol bo'lsa, o'z paneliga qaytaramiz.
export function RequireRole({ allow }) {
  const { user, loading, mustChangePassword } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/account" replace />;
  if (user.role !== allow) return <Navigate to={`/${user.role}`} replace />;
  return <Layout />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<RequireAuth />}>
        <Route index element={<Account />} />
      </Route>

      <Route path="/teacher" element={<RequireRole allow="teacher" />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Route>

      <Route path="/admin" element={<RequireRole allow="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
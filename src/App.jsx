import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSchedule from './pages/teacher/Schedule';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSchedule from './pages/admin/Schedule';

// Navbar + Sidebar + sahifa mazmuni (<Outlet />)
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authError } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="content">
          {authError && <div className="error notice" role="alert">{authError}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Faqat o'z roli kirishi mumkin. Boshqa rol bo'lsa, o'z paneliga qaytaramiz.
function RequireRole({ allow }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-message">Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allow) return <Navigate to={`/${user.role}`} replace />;
  return <Layout />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-message">Yuklanmoqda...</div>;
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
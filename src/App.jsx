import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSchedule from './pages/teacher/Schedule';
import AdminLessons from './pages/admin/Lessons';

// Navbar + Sidebar + sahifa mazmuni (<Outlet />)
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Faqat o'z roli kirishi mumkin. Boshqa rol bo'lsa, o'z paneliga qaytaramiz.
function RequireRole({ allow }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allow) return <Navigate to={`/${user.role}`} replace />;
  return <Layout />;
}

// Hali yozilmagan sahifalar uchun vaqtinchalik
function Soon() {
  return (
    <div className="card">
      <h2>Tez orada 🚧</h2>
      <p className="muted">Bu sahifa keyingi bosqichlarda qo'shiladi.</p>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/teacher" element={<RequireRole allow="teacher" />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="*" element={<Soon />} />
      </Route>

      <Route path="/admin" element={<RequireRole allow="admin" />}>
        <Route index element={<Soon />} />
        <Route path="lessons" element={<AdminLessons />} />
        <Route path="*" element={<Soon />} />
      </Route>

      {['student', 'parent'].map((role) => (
        <Route key={role} path={`/${role}`} element={<RequireRole allow={role} />}>
          <Route index element={<Soon />} />
          <Route path="*" element={<Soon />} />
        </Route>
      ))}

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
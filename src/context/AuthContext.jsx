import { createContext, useContext, useState } from 'react';
import { get, set, remove } from '../lib/storage';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

// Demo foydalanuvchilar. Backend qo'shilganda bu o'chadi.
const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin', role: ROLES.ADMIN },
  { id: 2, username: 'ustoz', password: 'ustoz123', name: 'Dilnoza Karimova', role: ROLES.TEACHER },
  { id: 3, username: 'oquvchi', password: 'oquvchi123', name: 'Jasur Aliyev', role: ROLES.STUDENT },
  { id: 4, username: 'ota-ona', password: 'ota123', name: 'Bahodir Aliyev', role: ROLES.PARENT },
];

function loadUsers() {
  const users = get('users');
  if (Array.isArray(users) && users.length > 0) return users;
  set('users', DEMO_USERS);
  return DEMO_USERS;
}

// Parol UI ga o'tib ketmasligi uchun olib tashlaymiz
function publicUser({ password: _password, ...rest }) {
  return rest;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const users = loadUsers();
    const session = get('session');
    const found = session && users.find((u) => u.id === session.userId);
    return found ? publicUser(found) : null;
  });

  const login = (username, password) => {
    const found = loadUsers().find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Login yoki parol noto'g'ri" };

    set('session', { userId: found.id });
    const safe = publicUser(found);
    setUser(safe);
    return { ok: true, user: safe };
  };

  const logout = () => {
    remove('session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user ? user.role : null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth faqat AuthProvider ichida ishlatiladi');
  return ctx;
}

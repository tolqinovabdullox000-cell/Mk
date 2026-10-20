import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO = [
  { label: 'Admin', username: 'admin', password: 'admin123' },
  { label: 'Ustoz', username: 'ustoz', password: 'ustoz123' },
  { label: "O'quvchi", username: 'oquvchi', password: 'oquvchi123' },
  { label: 'Ota-ona', username: 'ota-ona', password: 'ota123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.ok) navigate(`/${res.user.role}`, { replace: true });
    else setError(res.error);
  };

  const fillDemo = (d) => {
    setUsername(d.username);
    setPassword(d.password);
    setError('');
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>📚 UstozPanel</h1>
        <p className="muted">Hisobingizga kiring</p>

        <label>Login</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label>Parol</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary" type="submit">Kirish</button>

        <div className="demo-box">
          <p className="muted">Demo hisoblar (bosib to'ldiring):</p>
          <div className="demo-list">
            {DEMO.map((d) => (
              <button key={d.username} type="button" className="btn btn-outline" onClick={() => fillDemo(d)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

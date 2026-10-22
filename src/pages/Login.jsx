import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res.ok) navigate(`/${res.user.role}`, { replace: true });
      else setError(res.error);
    } catch (loginError) {
      setError(`Kirishda xatolik: ${loginError.message}`);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>📚 UstozPanel</h1>
        <p className="muted">Hisobingizga kiring</p>

        <label htmlFor="email">Elektron pochta</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />

        <label htmlFor="password">Parol</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {(error || authError) && <div className="error" role="alert">{error || authError}</div>}

        <button className="btn btn-primary" type="submit">Kirish</button>
      </form>
    </div>
  );
}

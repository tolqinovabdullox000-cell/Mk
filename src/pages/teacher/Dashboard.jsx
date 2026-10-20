import { useAuth } from '../../context/AuthContext';
import { get } from '../../lib/storage';

const todayIdx = (new Date().getDay() + 6) % 7;

export default function Dashboard() {
  const { user } = useAuth();

  const today = get('lessons', [])
    .filter((l) => l.teacherId === user.id && l.day === todayIdx)
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <h2>Xush kelibsiz, {user.name}!</h2>

      <div className="card">
        <h3>Bugungi darslar</h3>
        {todayIdx === 6 ? (
          <p className="muted">Bugun yakshanba, dam olish kuni 🙂</p>
        ) : today.length === 0 ? (
          <p className="muted">Bugun sizga dars biriktirilmagan.</p>
        ) : (
          today.map((l) => (
            <div key={l.id} className="lesson">
              <span className="lesson-time">{l.start}-{l.end}</span>
              <span><strong>{l.subject}</strong> · {l.className} · {l.room}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

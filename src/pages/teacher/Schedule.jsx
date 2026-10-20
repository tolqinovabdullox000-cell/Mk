import { useAuth } from '../../context/AuthContext';
import { get } from '../../lib/storage';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const todayIdx = (new Date().getDay() + 6) % 7;

export default function Schedule() {
  const { user } = useAuth();

  // Faqat shu ustozga biriktirilgan darslar
  const mine = get('lessons', []).filter((l) => l.teacherId === user.id);

  // JS da yakshanba = 0, bizda dushanba = 0 bo'lishi uchun
  return (
    <div>
      <h2>Dars jadvali</h2>

      {mine.length === 0 && (
        <div className="card">
          <p className="muted">Sizga hali dars biriktirilmagan. Admin dars qo'shgach, shu yerda ko'rinadi.</p>
        </div>
      )}

      {mine.length > 0 &&
        DAYS.map((dayName, idx) => {
          const dayLessons = mine
            .filter((l) => l.day === idx)
            .sort((a, b) => a.start.localeCompare(b.start));

          return (
            <div key={dayName} className={'card day-card' + (idx === todayIdx ? ' today' : '')}>
              <h3>
                {dayName} {idx === todayIdx && <span className="badge">Bugun</span>}
              </h3>
              {dayLessons.length === 0 ? (
                <p className="muted">Dars yo'q</p>
              ) : (
                dayLessons.map((l) => (
                  <div key={l.id} className="lesson">
                    <span className="lesson-time">{l.start}-{l.end}</span>
                    <span><strong>{l.subject}</strong> · {l.className} · {l.room}</span>
                  </div>
                ))
              )}
            </div>
          );
        })}
    </div>
  );
}

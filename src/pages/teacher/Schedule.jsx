import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const today = (new Date().getDay() + 6) % 7 + 1;

export default function Schedule() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSchedule() {
      setLoading(true);
      setError('');
      if (!supabase) {
        setError('Supabase sozlanmagan. .env faylini tekshiring.');
        setLoading(false);
        return;
      }

      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!active) return;
      if (teacherError) {
        setError(`Ustoz profilini topishda xatolik: ${teacherError.message}`);
        setLoading(false);
        return;
      }
      if (!teacher) {
        setError('Ustoz profilingiz tizimga bog‘lanmagan. Administratorga murojaat qiling.');
        setLoading(false);
        return;
      }

      const { data, error: lessonError } = await supabase
        .from('lessons')
        .select('id, subject, weekday, lesson_no, room, classes(grade, letter)')
        .eq('teacher_id', teacher.id)
        .order('weekday')
        .order('lesson_no');

      if (!active) return;
      if (lessonError) setError(`Jadvalni yuklashda xatolik: ${lessonError.message}`);
      else setLessons(data ?? []);
      setLoading(false);
    }

    loadSchedule().catch((loadError) => {
      if (!active) return;
      setError(`Jadvalni yuklashda xatolik: ${loadError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">USTOZ PANELI</p><h1>Dars jadvali</h1><p className="muted">Haftalik darslaringiz.</p></div></div>
      {error && <div className="error notice" role="alert">{error}</div>}
      {loading ? <div className="card"><p className="muted">Jadval yuklanmoqda...</p></div> : (
        <div className="teacher-week">
          {DAYS.map((day, index) => {
            const dayLessons = lessons.filter((lesson) => lesson.weekday === index + 1);
            return (
              <div key={day} className={`card day-card ${today === index + 1 ? 'today' : ''}`}>
                <h2>{day} {today === index + 1 && <span className="badge">Bugun</span>}</h2>
                {dayLessons.length === 0 ? <p className="muted">Dars yo'q</p> : dayLessons.map((lesson) => (
                  <div key={lesson.id} className="lesson">
                    <span className="lesson-time">{lesson.lesson_no}-dars</span>
                    <span><strong>{lesson.subject}</strong> · {lesson.classes?.grade}-{lesson.classes?.letter} · {lesson.room}-xona</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';

const today = (new Date().getDay() + 6) % 7 + 1;

export default function Dashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadToday() {
      setLoading(true);
      setError('');
      if (!supabase) {
        setError('Supabase sozlanmagan. .env faylini tekshiring.');
        setLoading(false);
        return;
      }
      if (today > 6) {
        setLessons([]);
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
        .eq('weekday', today)
        .order('lesson_no');

      if (!active) return;
      if (lessonError) setError(`Bugungi darslarni yuklashda xatolik: ${lessonError.message}`);
      else setLessons(data ?? []);
      setLoading(false);
    }

    loadToday().catch((loadError) => {
      if (!active) return;
      setError(`Bugungi darslarni yuklashda xatolik: ${loadError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">USTOZ PANELI</p><h1>Xush kelibsiz, {user.name}!</h1><p className="muted">Bugungi darslaringiz.</p></div></div>
      {error && <div className="error notice" role="alert">{error}</div>}
      <div className="card">
        <h2>Bugungi darslar</h2>
        {today > 6 ? <p className="muted">Bugun yakshanba, dam olish kuni 🙂</p> : loading ? <p className="muted">Yuklanmoqda...</p> : lessons.length === 0 ? (
          <p className="muted">Bugun sizga dars biriktirilmagan.</p>
        ) : lessons.map((lesson) => (
          <div key={lesson.id} className="lesson">
            <span className="lesson-time">{lesson.lesson_no}-dars</span>
            <span><strong>{lesson.subject}</strong> · {lesson.classes?.grade}-{lesson.classes?.letter} · {lesson.room}-xona</span>
          </div>
        ))}
      </div>
    </section>
  );
}

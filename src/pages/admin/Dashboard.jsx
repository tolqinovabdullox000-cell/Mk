import { useEffect, useState } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import { supabase } from '../../lib/supabase';

const GRADES = Array.from({ length: 11 }, (_, index) => index + 1);
const LESSON_SELECT = '*, classes(grade, letter), teachers(full_name)';
const TODAY = (new Date().getDay() + 6) % 7 + 1;
const DAY_NAMES = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

export default function Dashboard() {
  const [stats, setStats] = useState({ teachers: 0, classes: 0, lessons: 0 });
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [todayLessons, setTodayLessons] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      if (!supabase) {
        setError('Supabase sozlanmagan. .env faylini tekshiring.');
        setLoading(false);
        return;
      }

      const [teacherResult, classCountResult, lessonCountResult, classResult, lessonResult, todayCountResult, todayLessonsResult] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id, grade, letter').order('grade').order('letter'),
        supabase.from('lessons').select(LESSON_SELECT).order('weekday').order('lesson_no'),
        supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('weekday', TODAY),
        supabase.from('lessons').select(LESSON_SELECT).eq('weekday', TODAY).order('lesson_no').limit(6),
      ]);

      if (!active) return;
      if (teacherResult.error || classCountResult.error || lessonCountResult.error || classResult.error || lessonResult.error || todayCountResult.error || todayLessonsResult.error) {
        const details = [
          teacherResult.error && `Ustozlar: ${teacherResult.error.message}`,
          classCountResult.error && `Sinflar soni: ${classCountResult.error.message}`,
          lessonCountResult.error && `Darslar soni: ${lessonCountResult.error.message}`,
          classResult.error && `Sinflar: ${classResult.error.message}`,
          lessonResult.error && `Jadval: ${lessonResult.error.message}`,
          todayCountResult.error && `Bugungi darslar soni: ${todayCountResult.error.message}`,
          todayLessonsResult.error && `Bugungi darslar: ${todayLessonsResult.error.message}`,
        ].filter(Boolean).join(' · ');
        setError(`Bosh sahifani yuklashda xatolik: ${details}`);
      } else {
        const nextClasses = classResult.data ?? [];
        setStats({
          teachers: teacherResult.count ?? 0,
          classes: classCountResult.count ?? 0,
          lessons: lessonCountResult.count ?? 0,
        });
        setClasses(nextClasses);
        setLessons(lessonResult.data ?? []);
        setTodayCount(todayCountResult.count ?? 0);
        setTodayLessons(todayLessonsResult.data ?? []);
      }
      setLoading(false);
    }

    loadDashboard().catch((loadError) => {
      if (!active) return;
      setError(`Bosh sahifani yuklashda xatolik: ${loadError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const parallelClasses = classes.filter((item) => item.grade === selectedGrade);
  const selectedClass = parallelClasses.find((item) => item.id === selectedClassId) ?? parallelClasses[0];

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">ADMIN PANEL</p><h1>Bosh sahifa</h1><p className="muted">Maktab jadvali va umumiy ko'rsatkichlar.</p></div>
      </div>
      {error && <div className="error notice" role="alert">{error}</div>}

      <div className="stats-grid">
        <article className="stat-card stat-purple"><span>Ustozlar</span><strong>{loading ? '…' : stats.teachers}</strong><small>Ro'yxatdagi ustozlar</small></article>
        <article className="stat-card stat-blue"><span>Sinflar</span><strong>{loading ? '…' : stats.classes}</strong><small>Tashkil etilgan sinflar</small></article>
        <article className="stat-card stat-pink"><span>Darslar</span><strong>{loading ? '…' : stats.lessons}</strong><small>Haftalik jadvaldagi darslar</small></article>
      </div>

      <div className="schedule-dashboard card">
        <div className="section-heading"><div><p className="eyebrow">HAFTALIK JADVAL</p><h2>Sinf jadvali</h2></div></div>
        <div className="chip-list grade-list">
          {GRADES.map((value) => (
            <button type="button" className={`chip-button ${selectedGrade === value ? 'selected' : ''}`} key={value} onClick={() => setSelectedGrade(value)}>{value}-sinf</button>
          ))}
        </div>
        {parallelClasses.length > 0 ? (
          <>
            <div className="chip-list parallel-list">
              {parallelClasses.map((item) => (
                <button type="button" className={`chip-button ${selectedClass?.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedClassId(item.id)}>{item.grade}-{item.letter}</button>
              ))}
            </div>
            <TimetableGrid lessons={lessons} classId={selectedClass?.id} readOnly highlightToday />
          </>
        ) : <p className="muted empty-state">{loading ? 'Jadval yuklanmoqda...' : 'Bu sinflar hali qo‘shilmagan.'}</p>}
      </div>

      <div className="card today-lessons-card">
        <div className="section-heading">
          <div><p className="eyebrow">BUGUN</p><h2>Bugungi darslar</h2></div>
          {!loading && <span className="today-count">{todayCount} ta dars</span>}
        </div>
        {loading ? <p className="muted">Darslar yuklanmoqda...</p> : todayCount === 0 ? (
          <p className="muted">Bugun ({TODAY > 6 ? 'Yakshanba' : DAY_NAMES[TODAY - 1]}) dars rejalashtirilmagan.</p>
        ) : (
          <div className="today-lessons-list">
            {todayLessons.slice(0, 6).map((lesson) => (
              <div className="today-lesson-row" key={lesson.id}>
                <span className="today-period">{lesson.lesson_no}-dars</span>
                <strong>{lesson.subject}</strong>
                <span>{lesson.classes?.grade}-{lesson.classes?.letter} sinf</span>
                <span className="muted">{lesson.teachers?.full_name ?? 'Ustoz ko‘rsatilmagan'}</span>
              </div>
            ))}
            {todayCount > todayLessons.length && <p className="muted today-more">Yana {todayCount - todayLessons.length} ta dars mavjud.</p>}
          </div>
        )}
      </div>
    </section>
  );
}

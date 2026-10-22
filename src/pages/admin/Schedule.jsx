import { useEffect, useMemo, useState } from 'react';
import TimetableGrid, { DAYS } from '../../components/TimetableGrid';
import { supabase } from '../../lib/supabase';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LESSON_SELECT = '*, classes(grade, letter), teachers(full_name)';

export default function Schedule() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [grade, setGrade] = useState('1');
  const [letter, setLetter] = useState('A');
  const [lessonForm, setLessonForm] = useState({ weekday: '1', lesson_no: '1', subject: '', teacher_id: '', room: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

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

      const [classResult, teacherResult, lessonResult] = await Promise.all([
        supabase.from('classes').select('id, grade, letter').order('grade').order('letter'),
        supabase.from('teachers').select('id, full_name, subjects').order('full_name'),
        supabase.from('lessons').select(LESSON_SELECT).order('weekday').order('lesson_no'),
      ]);

      if (!active) return;
      if (classResult.error || teacherResult.error || lessonResult.error) {
        const details = [
          classResult.error && `Sinflar: ${classResult.error.message}`,
          teacherResult.error && `Ustozlar: ${teacherResult.error.message}`,
          lessonResult.error && `Darslar: ${lessonResult.error.message}`,
        ].filter(Boolean).join(' · ');
        setError(`Ma'lumotlarni yuklashda xatolik: ${details}`);
      } else {
        const nextClasses = classResult.data ?? [];
        setClasses(nextClasses);
        setTeachers(teacherResult.data ?? []);
        setLessons(lessonResult.data ?? []);
        setSelectedClassId((currentId) => nextClasses.some((item) => item.id === currentId)
          ? currentId
          : nextClasses[0]?.id ?? '');
      }
      setLoading(false);
    }

    loadSchedule().catch((loadError) => {
      if (!active) return;
      setError(`Ma'lumotlarni yuklashda xatolik: ${loadError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refresh]);

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const subjects = useMemo(
    () => [...new Set(teachers.flatMap((teacher) => teacher.subjects ?? []))].sort((a, b) => a.localeCompare(b, 'uz')),
    [teachers],
  );
  const eligibleTeachers = teachers.filter((teacher) => teacher.subjects?.includes(lessonForm.subject));

  const addClass = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setError('Supabase sozlanmagan. .env faylini tekshiring.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data, error: insertError } = await supabase
        .from('classes')
        .insert({ grade: Number(grade), letter })
        .select('id')
        .single();
      if (insertError) {
        setError(insertError.code === '23505'
          ? `${grade}-${letter} sinfi allaqachon mavjud.`
          : `Sinf qo'shishda xatolik: ${insertError.message}`);
        return;
      }
      setSelectedClassId(data.id);
      setRefresh((value) => value + 1);
    } catch (insertError) {
      setError(`Sinf qo'shishda xatolik: ${insertError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (event) => {
    event.preventDefault();
    if (!selectedClassId || !lessonForm.subject || !lessonForm.teacher_id || !lessonForm.room.trim()) {
      setError("Sinf, fan, ustoz va xona maydonlarini to'ldiring.");
      return;
    }
    if (!supabase) {
      setError('Supabase sozlanmagan. .env faylini tekshiring.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('lessons').insert({
        class_id: selectedClassId,
        teacher_id: lessonForm.teacher_id,
        subject: lessonForm.subject,
        weekday: Number(lessonForm.weekday),
        lesson_no: Number(lessonForm.lesson_no),
        room: lessonForm.room.trim(),
      });
      if (insertError) {
        setError(insertError.code === '23505'
          ? 'Bu vaqtda sinfda yoki ustozda boshqa dars bor.'
          : `Dars qo'shishda xatolik: ${insertError.message}`);
        return;
      }
      setRefresh((value) => value + 1);
    } catch (insertError) {
      setError(`Dars qo'shishda xatolik: ${insertError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lesson) => {
    if (!window.confirm(`${lesson.subject} darsini jadvaldan o'chirasizmi?`)) return;
    if (!supabase) {
      setError('Supabase sozlanmagan. .env faylini tekshiring.');
      return;
    }

    setError('');
    try {
      const { error: deleteError } = await supabase.from('lessons').delete().eq('id', lesson.id);
      if (deleteError) {
        setError(`Darsni o'chirishda xatolik: ${deleteError.message}`);
        return;
      }
      setRefresh((value) => value + 1);
    } catch (deleteError) {
      setError(`Darsni o'chirishda xatolik: ${deleteError.message}`);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">ADMIN PANEL</p><h1>Sinflar va dars jadvali</h1><p className="muted">Sinfni tanlang va haftalik darslarni rejalashtiring.</p></div>
      </div>

      {error && <div className="error notice" role="alert">{error}</div>}

      <div className="schedule-top-grid">
        <form className="card compact-form" onSubmit={addClass}>
          <h2>Sinf qo'shish</h2>
          <div className="inline-fields">
            <div><label htmlFor="class-grade">Sinf</label><select id="class-grade" value={grade} onChange={(event) => setGrade(event.target.value)}>{Array.from({ length: 11 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}-sinf</option>)}</select></div>
            <div><label htmlFor="class-letter">Harf</label><select id="class-letter" value={letter} onChange={(event) => setLetter(event.target.value)}>{LETTERS.split('').map((value) => <option key={value}>{value}</option>)}</select></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>Qo'shish</button>
          </div>
        </form>
      </div>

      <div className="class-picker card">
        <div className="class-picker-heading"><h2>Sinfni tanlang</h2><span className="muted">{classes.length} ta sinf</span></div>
        {loading ? <p className="muted">Yuklanmoqda...</p> : classes.length === 0 ? <p className="muted">Avval sinf qo'shing.</p> : (
          <div className="chip-list">
            {classes.map((item) => (
              <button className={`chip-button ${item.id === selectedClassId ? 'selected' : ''}`} type="button" key={item.id} onClick={() => setSelectedClassId(item.id)}>
                {item.grade}-{item.letter}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedClass && (
        <>
          <div className="section-heading"><h2>{selectedClass.grade}-{selectedClass.letter} sinf jadvali</h2></div>
          <div className="card lesson-form-card">
            <h3>Dars qo'shish</h3>
            <form className="lesson-form-grid" onSubmit={addLesson}>
              <div><label htmlFor="lesson-weekday">Hafta kuni</label><select id="lesson-weekday" value={lessonForm.weekday} onChange={(event) => setLessonForm({ ...lessonForm, weekday: event.target.value })}>{DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></div>
              <div><label htmlFor="lesson-no">Dars raqami</label><select id="lesson-no" value={lessonForm.lesson_no} onChange={(event) => setLessonForm({ ...lessonForm, lesson_no: event.target.value })}>{Array.from({ length: 9 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}-dars</option>)}</select></div>
              <div><label htmlFor="lesson-subject">Fan</label><select id="lesson-subject" value={lessonForm.subject} onChange={(event) => setLessonForm({ ...lessonForm, subject: event.target.value, teacher_id: '' })} required><option value="">Fan tanlang</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></div>
              <div><label htmlFor="lesson-teacher">Ustoz</label><select id="lesson-teacher" value={lessonForm.teacher_id} onChange={(event) => setLessonForm({ ...lessonForm, teacher_id: event.target.value })} required disabled={!lessonForm.subject}><option value="">Ustoz tanlang</option>{eligibleTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}</select></div>
              <div><label htmlFor="lesson-room">Xona</label><input id="lesson-room" value={lessonForm.room} onChange={(event) => setLessonForm({ ...lessonForm, room: event.target.value })} placeholder="12" required /></div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saqlanmoqda...' : "Dars qo'shish"}</button>
            </form>
          </div>

          <div className="card timetable-card">
            <TimetableGrid lessons={lessons} classId={selectedClassId} onDelete={removeLesson} />
          </div>
        </>
      )}
    </section>
  );
}

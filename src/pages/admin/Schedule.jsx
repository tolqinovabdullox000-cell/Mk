import { useCallback, useState } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorNotice from '../../components/ui/ErrorNotice';
import { useAsync } from '../../hooks/useAsync';
import { useI18n } from '../../i18n/useI18n';
import { toAppError } from '../../lib/api/client';
import { createClass, listClasses } from '../../lib/api/classes';
import { createLesson, deleteLesson, listLessons } from '../../lib/api/lessons';
import { listTeachers } from '../../lib/api/teachers';
import { CLASS_LETTERS, DAYS, LESSON_NUMBERS, SUBJECT_CODES } from '../../lib/constants';

const GRADES = Array.from({ length: 11 }, (_, index) => index + 1);
const EMPTY_LESSON = { weekday: '1', lesson_no: '1', subject: '', teacher_id: '', room: '', allow_shared_room: false };

export default function Schedule() {
  const { t } = useI18n();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [grade, setGrade] = useState('1');
  const [letter, setLetter] = useState('A');
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const loadSchedule = useCallback(async () => {
    const [classes, teachers, lessons] = await Promise.all([listClasses(), listTeachers(), listLessons()]);
    return { classes, teachers, lessons };
  }, []);
  const { data, error: loadError, loading, reload } = useAsync(loadSchedule);
  const classes = data?.classes ?? [];
  const teachers = data?.teachers ?? [];
  const lessons = data?.lessons ?? [];
  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? classes[0];
  const subjects = SUBJECT_CODES.filter((code) => teachers.some((teacher) => teacher.subjects?.includes(code)));
  const eligibleTeachers = teachers.filter((teacher) => teacher.subjects?.includes(lessonForm.subject));

  const displayError = (cause) => {
    const key = toAppError(cause);
    if (key === 'errors.roomBusy' && selectedClass) {
      return t('errors.roomBusyForClass', { className: `${selectedClass.grade}-${selectedClass.letter}` });
    }
    return t(key);
  };

  const addClass = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await createClass({ grade: Number(grade), letter });
      setSelectedClassId(created.id);
      reload();
    } catch (cause) {
      setError(displayError(cause));
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (event) => {
    event.preventDefault();
    if (!selectedClass || !lessonForm.subject || !lessonForm.teacher_id || !lessonForm.room.trim()) {
      setError(t('schedule.requiredFields'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createLesson({
        class_id: selectedClass.id,
        teacher_id: lessonForm.teacher_id,
        subject: lessonForm.subject,
        weekday: Number(lessonForm.weekday),
        lesson_no: Number(lessonForm.lesson_no),
        room: lessonForm.room.trim(),
        allow_shared_room: lessonForm.allow_shared_room,
      });
      setLessonForm(EMPTY_LESSON);
      reload();
    } catch (cause) {
      setError(displayError(cause));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setError('');
    try {
      await deleteLesson(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (cause) {
      setError(displayError(cause));
      setDeleteTarget(null);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">{t('dashboard.admin')}</p><h1>{t('schedule.adminTitle')}</h1><p className="muted">{t('schedule.adminDescription')}</p></div>
      </div>

      <ErrorNotice>{error || (loadError && displayError(loadError))}</ErrorNotice>

      <div className="schedule-top-grid">
        <form className="card compact-form" onSubmit={addClass}>
          <h2>{t('schedule.addClass')}</h2>
          <div className="inline-fields">
            <div><label htmlFor="class-grade">{t('schedule.grade')}</label><select id="class-grade" value={grade} onChange={(event) => setGrade(event.target.value)}>{GRADES.map((value) => <option key={value} value={value}>{t('schedule.gradeNumber', { n: value })}</option>)}</select></div>
            <div><label htmlFor="class-letter">{t('schedule.letter')}</label><select id="class-letter" value={letter} onChange={(event) => setLetter(event.target.value)}>{CLASS_LETTERS.map((value) => <option key={value}>{value}</option>)}</select></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{t('schedule.add')}</button>
          </div>
        </form>
      </div>

      <div className="class-picker card">
        <div className="class-picker-heading"><h2>{t('schedule.selectClass')}</h2><span className="muted">{t('schedule.classCount', { n: classes.length })}</span></div>
        {loading ? <p className="muted">{t('common.loading')}</p> : classes.length === 0 ? <p className="muted">{t('schedule.noClasses')}</p> : (
          <div className="chip-list">
            {classes.map((item) => (
              <button className={`chip-button ${item.id === selectedClass?.id ? 'selected' : ''}`} type="button" key={item.id} onClick={() => setSelectedClassId(item.id)}>
                {item.grade}-{item.letter}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedClass && (
        <>
          <div className="section-heading"><h2>{t('schedule.classScheduleNamed', { className: `${selectedClass.grade}-${selectedClass.letter}` })}</h2></div>
          <div className="card lesson-form-card">
            <h3>{t('schedule.addLesson')}</h3>
            <form className="lesson-form-grid" onSubmit={addLesson}>
              <div><label htmlFor="lesson-weekday">{t('schedule.weekday')}</label><select id="lesson-weekday" value={lessonForm.weekday} onChange={(event) => setLessonForm({ ...lessonForm, weekday: event.target.value })}>{DAYS.filter((day) => day.value <= 6).map((day) => <option key={day.value} value={day.value}>{t(day.key)}</option>)}</select></div>
              <div><label htmlFor="lesson-no">{t('schedule.lessonNumber')}</label><select id="lesson-no" value={lessonForm.lesson_no} onChange={(event) => setLessonForm({ ...lessonForm, lesson_no: event.target.value })}>{LESSON_NUMBERS.map((value) => <option key={value} value={value}>{t('schedule.period', { n: value })}</option>)}</select></div>
              <div><label htmlFor="lesson-subject">{t('schedule.subject')}</label><select id="lesson-subject" value={lessonForm.subject} onChange={(event) => setLessonForm({ ...lessonForm, subject: event.target.value, teacher_id: '' })} required><option value="">{t('schedule.selectSubject')}</option>{subjects.map((code) => <option key={code} value={code}>{t(`subjects.${code}`)}</option>)}</select></div>
              <div><label htmlFor="lesson-teacher">{t('schedule.teacher')}</label><select id="lesson-teacher" value={lessonForm.teacher_id} onChange={(event) => setLessonForm({ ...lessonForm, teacher_id: event.target.value })} required disabled={!lessonForm.subject}><option value="">{t('schedule.selectTeacher')}</option>{eligibleTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}</select></div>
              <div><label htmlFor="lesson-room">{t('schedule.room')}</label><input id="lesson-room" value={lessonForm.room} onChange={(event) => setLessonForm({ ...lessonForm, room: event.target.value })} placeholder={t('schedule.roomPlaceholder')} required /></div>
              <label className="checkbox-field" htmlFor="shared-room"><input id="shared-room" type="checkbox" checked={lessonForm.allow_shared_room} onChange={(event) => setLessonForm({ ...lessonForm, allow_shared_room: event.target.checked })} />{t('schedule.sharedRoom')}</label>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? t('common.saving') : t('schedule.addLesson')}</button>
            </form>
          </div>

          <div className="card timetable-card">
            <TimetableGrid lessons={lessons} classId={selectedClass.id} onDelete={setDeleteTarget} />
          </div>
        </>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('schedule.deleteLesson')}
        message={t('schedule.confirmDeleteLesson', { subject: t(`subjects.${deleteTarget?.subject ?? ''}`) })}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

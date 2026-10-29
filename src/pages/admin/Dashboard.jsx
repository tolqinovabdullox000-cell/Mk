import { useCallback, useState } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import ErrorNotice from '../../components/ui/ErrorNotice';
import { useAsync } from '../../hooks/useAsync';
import { useI18n } from '../../i18n/useI18n';
import { countTeachers } from '../../lib/api/teachers';
import { listClasses } from '../../lib/api/classes';
import { listLessons } from '../../lib/api/lessons';
import { toAppError } from '../../lib/api/client';
import { useToday } from '../../lib/dates';
import { DAYS } from '../../lib/constants';

const GRADES = Array.from({ length: 11 }, (_, index) => index + 1);

export default function Dashboard() {
  const { t } = useI18n();
  const { weekday } = useToday();
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState('');
  const loadDashboard = useCallback(async () => {
    const [teachers, classes, lessons] = await Promise.all([
      countTeachers(),
      listClasses(),
      listLessons(),
    ]);
    return { teachers, classes, lessons };
  }, []);
  const { data, error, loading } = useAsync(loadDashboard);
  const classes = data?.classes ?? [];
  const lessons = data?.lessons ?? [];
  const parallelClasses = classes.filter((item) => item.grade === selectedGrade);
  const selectedClass = parallelClasses.find((item) => item.id === selectedClassId) ?? parallelClasses[0];
  const todayLessons = weekday === 7 ? [] : lessons
    .filter((lesson) => lesson.weekday === weekday)
    .sort((a, b) => a.lesson_no - b.lesson_no);
  const dayKey = DAYS.find((day) => day.value === weekday)?.key.split('.')[1];

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">{t('dashboard.admin')}</p><h1>{t('dashboard.admin')}</h1><p className="muted">{t('dashboard.overview')}</p></div>
      </div>
      <ErrorNotice>{error && t(toAppError(error))}</ErrorNotice>

      <div className="stats-grid">
        <article className="stat-card stat-purple"><span>{t('dashboard.teachers')}</span><strong>{loading ? '…' : data?.teachers ?? 0}</strong><small>{t('dashboard.teacherCount')}</small></article>
        <article className="stat-card stat-blue"><span>{t('dashboard.classes')}</span><strong>{loading ? '…' : classes.length}</strong><small>{t('dashboard.classCount')}</small></article>
        <article className="stat-card stat-pink"><span>{t('dashboard.lessons')}</span><strong>{loading ? '…' : lessons.length}</strong><small>{t('dashboard.lessonCount')}</small></article>
      </div>

      <div className="schedule-dashboard card">
        <div className="section-heading"><div><p className="eyebrow">{t('dashboard.weekSchedule')}</p><h2>{t('dashboard.classSchedule')}</h2></div></div>
        <div className="chip-list grade-list">
          {GRADES.map((value) => (
            <button type="button" className={`chip-button ${selectedGrade === value ? 'selected' : ''}`} key={value} onClick={() => setSelectedGrade(value)}>
              {t('schedule.gradeNumber', { n: value })}
            </button>
          ))}
        </div>
        {parallelClasses.length > 0 ? (
          <>
            <div className="chip-list parallel-list">
              {parallelClasses.map((item) => (
                <button type="button" className={`chip-button ${selectedClass?.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedClassId(item.id)}>
                  {item.grade}-{item.letter}
                </button>
              ))}
            </div>
            <TimetableGrid lessons={lessons} classId={selectedClass?.id} readOnly highlightToday />
          </>
        ) : <p className="muted empty-state">{loading ? t('common.loading') : t('dashboard.noClasses')}</p>}
      </div>

      <div className="card today-lessons-card">
        <div className="section-heading">
          <div><p className="eyebrow">{t('common.today')}</p><h2>{t('dashboard.todayLessons')}</h2></div>
          {!loading && <span className="today-count">{t('dashboard.lessonCountLabel', { n: todayLessons.length })}</span>}
        </div>
        {loading ? <p className="muted">{t('common.loading')}</p> : todayLessons.length === 0 ? (
          <p className="muted">{t('dashboard.noLessonsToday', { day: t(`weekdays.${dayKey}`) })}</p>
        ) : (
          <div className="today-lessons-list">
            {todayLessons.slice(0, 6).map((lesson) => (
              <div className="today-lesson-row" key={lesson.id}>
                <span className="today-period">{t('schedule.period', { n: lesson.lesson_no })}</span>
                <strong>{t(`subjects.${lesson.subject}`)}</strong>
                <span>{lesson.classes?.grade}-{lesson.classes?.letter} {t('schedule.classSuffix')}</span>
                <span className="muted">{lesson.teachers?.full_name ?? t('dashboard.noTeacher')}</span>
              </div>
            ))}
            {todayLessons.length > 6 && <p className="muted today-more">{t('dashboard.moreLessons', { n: todayLessons.length - 6 })}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

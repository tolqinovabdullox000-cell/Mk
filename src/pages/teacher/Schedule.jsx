import { useAuth } from '../../context/useAuth';
import ErrorNotice from '../../components/ui/ErrorNotice';
import { useTeacherSchedule } from '../../hooks/useTeacherSchedule';
import { toAppError } from '../../lib/api/client';
import { DAYS } from '../../lib/constants';
import { useToday } from '../../lib/dates';
import { useI18n } from '../../i18n/useI18n';

export default function Schedule() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { weekday } = useToday();
  const { lessons, loading, error, teacherMissing } = useTeacherSchedule(user.id, weekday);

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">{t('dashboard.teacher')}</p><h1>{t('schedule.title')}</h1><p className="muted">{t('schedule.weekly')}</p></div></div>
      <ErrorNotice>{teacherMissing ? t('dashboard.teacherMissing') : error && t(toAppError(error))}</ErrorNotice>
      {loading ? <div className="card"><p className="muted">{t('common.loading')}</p></div> : (
        <div className="teacher-week">
          {DAYS.filter((day) => day.value <= 6).map((day) => {
            const dayLessons = lessons.filter((lesson) => lesson.weekday === day.value);
            return (
              <div key={day.value} className={`card day-card ${weekday === day.value ? 'today' : ''}`}>
                <h2>{t(day.key)} {weekday === day.value && <span className="badge">{t('common.today')}</span>}</h2>
                {dayLessons.length === 0 ? <p className="muted">{t('schedule.noLessons')}</p> : dayLessons.map((lesson) => (
                  <div key={lesson.id} className="lesson">
                    <span className="lesson-time">{t('schedule.period', { n: lesson.lesson_no })}</span>
                    <span><strong>{t(`subjects.${lesson.subject}`)}</strong> · {lesson.classes?.grade}-{lesson.classes?.letter} · {t('schedule.roomNumber', { n: lesson.room })}</span>
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

import { useAuth } from '../../context/useAuth';
import ErrorNotice from '../../components/ui/ErrorNotice';
import { useTeacherSchedule } from '../../hooks/useTeacherSchedule';
import { useToday } from '../../lib/dates';
import { useI18n } from '../../i18n/useI18n';
import { toAppError } from '../../lib/api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { weekday } = useToday();
  const { lessons, loading, error, teacherMissing } = useTeacherSchedule(user.id, weekday);
  const todayLessons = lessons.filter((lesson) => lesson.weekday === weekday);

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">{t('dashboard.teacher')}</p><h1>{t('dashboard.welcome', { name: user.name })}</h1><p className="muted">{t('dashboard.teacherToday')}</p></div></div>
      <ErrorNotice>{teacherMissing ? t('dashboard.teacherMissing') : error && t(toAppError(error))}</ErrorNotice>
      <div className="card">
        <h2>{t('dashboard.todayLessons')}</h2>
        {weekday === 7 ? <p className="muted">{t('dashboard.sundayRest')}</p> : loading ? <p className="muted">{t('common.loading')}</p> : todayLessons.length === 0 ? (
          <p className="muted">{t('dashboard.noTeacherLessons')}</p>
        ) : todayLessons.map((lesson) => (
          <div key={lesson.id} className="lesson">
            <span className="lesson-time">{t('schedule.period', { n: lesson.lesson_no })}</span>
            <span><strong>{t(`subjects.${lesson.subject}`)}</strong> · {lesson.classes?.grade}-{lesson.classes?.letter} · {t('schedule.roomNumber', { n: lesson.room })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

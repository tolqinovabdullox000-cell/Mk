import { DAYS, LESSON_NUMBERS } from '../lib/constants';
import { useToday } from '../lib/dates';
import { useI18n } from '../i18n/useI18n';

export default function TimetableGrid({ lessons, classId, readOnly = false, onDelete, highlightToday = false }) {
  const { t } = useI18n();
  const { weekday } = useToday();
  const selectedLessons = lessons.filter((lesson) => lesson.class_id === classId);
  const weekdays = DAYS.filter((day) => day.value <= 6);

  return (
    <div className="timetable-scroll">
      <table className="timetable-grid">
        <thead>
          <tr>
            <th className="period-heading">{t('schedule.lessonNumber')}</th>
            {weekdays.map((day) => (
              <th className={highlightToday && day.value === weekday ? 'today-column' : ''} key={day.value}>
                {t(day.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LESSON_NUMBERS.map((lessonNo) => (
            <tr key={lessonNo}>
              <th className="period-number">{t('schedule.period', { n: lessonNo })}</th>
              {weekdays.map((day) => {
                const lesson = selectedLessons.find((item) => item.weekday === day.value && item.lesson_no === lessonNo);
                const isToday = highlightToday && day.value === weekday;
                return (
                  <td className={isToday ? 'today-column' : ''} key={day.value}>
                    {lesson ? (
                      <div className="timetable-lesson">
                        <strong>{t(`subjects.${lesson.subject}`)}</strong>
                        <span>{lesson.teachers?.full_name ?? t('dashboard.noTeacher')}</span>
                        {lesson.room && <small>{t('schedule.roomNumber', { n: lesson.room })}</small>}
                        {!readOnly && (
                          <button
                            className="lesson-remove"
                            type="button"
                            onClick={() => onDelete(lesson)}
                            aria-label={t('schedule.deleteLessonSubject', { subject: t(`subjects.${lesson.subject}`) })}
                          >×</button>
                        )}
                      </div>
                    ) : <span className="empty-slot" aria-label={t('schedule.emptySlot')}>—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
